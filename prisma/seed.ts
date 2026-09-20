// prisma/seed.ts
//
// Imports data/portfolios.json into Postgres via the shared Prisma client.
// Run with: bunx tsx prisma/seed.ts

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/src/db"; // same shared client used in auth.ts

type RawEntry = {
  "sl.no.": number;
  Username: string;
  "X url": string;
  "X image url": string;
  "portfolio url": string;
};

function extractHandle(xUrl: string): string | null {
  const match = xUrl?.match(/x\.com\/([^/?]+)/i);
  if (!match) return null;
  const handle = match[1].toLowerCase().trim();
  if (!handle || handle === "...") return null;
  return handle;
}

function extractDisplayName(username: string): string {
  // "Rakshit - @rakshit_yadav19" -> "Rakshit"
  const parts = username.split(" - @");
  return parts[0]?.trim() || username.trim();
}

function isJunkRow(entry: RawEntry): boolean {
  const url = entry["portfolio url"] || "";
  const xUrl = entry["X url"] || "";
  return !xUrl || xUrl === "various" || url.includes("...") || url.trim() === "";
}

async function main() {
  const filePath = path.join(process.cwd(), "data", "portfolios.json");
  const raw: RawEntry[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Loaded ${raw.length} raw entries.`);

  // 1. Drop junk placeholder rows and unparseable handles
  const clean = raw.filter(
    (entry) => !isJunkRow(entry) && extractHandle(entry["X url"]) !== null
  );
  console.log(`Skipped ${raw.length - clean.length} junk/unparseable rows.`);

  // 2. Dedupe by (handle + portfolioUrl) — same person can have multiple
  //    distinct pages, but exact repeats collapse to one.
  const seen = new Set<string>();
  const deduped = clean.filter((entry) => {
    const handle = extractHandle(entry["X url"])!;
    const key = `${handle}::${entry["portfolio url"].toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`${deduped.length} unique (handle, portfolioUrl) pairs to insert.`);

  // 3. Group by handle so each person becomes exactly one User row
  const byHandle = new Map<string, RawEntry[]>();
  for (const entry of deduped) {
    const handle = extractHandle(entry["X url"])!;
    if (!byHandle.has(handle)) byHandle.set(handle, []);
    byHandle.get(handle)!.push(entry);
  }
  console.log(`${byHandle.size} unique users to create.`);

  let usersCreated = 0;
  let pagesCreated = 0;
  let pagesSkipped = 0;

  for (const [handle, entries] of byHandle) {
    const first = entries[0];
    const displayName = extractDisplayName(first.Username);

    // Unclaimed placeholder — xId stays null until real X login links it
    const user = await prisma.user.upsert({
      where: { xHandle: handle },
      update: {},
      create: {
        xId: null,
        xUsername: displayName,
        xHandle: handle,
        xAvatar: first["X image url"] || null,
        totalPage: entries.length,
      },
    });
    usersCreated++;

    for (const entry of entries) {
      const websiteUrl = entry["portfolio url"].trim();
      const existingPage = await prisma.page.findFirst({
        where: { userId: user.id, websiteUrl },
        select: { id: true },
      });

      if (existingPage) {
        pagesSkipped++;
        continue;
      }

      await prisma.page.create({
        data: {
          userId: user.id,
          websiteUrl,
          coverUrl: null, // no screenshot service wired up yet
          title: displayName,
          oneLiner: `Portfolio by ${displayName}`,
          elo: 1000, // matches schema default, set explicitly for clarity
          bookmarked: 0,
          tags: ["portfolio"], // lowercase, matches [ai, saas, portfolio, hardware] convention
        },
      });
      pagesCreated++;
    }

    const totalPage = await prisma.page.count({ where: { userId: user.id } });
    await prisma.user.update({
      where: { id: user.id },
      data: { totalPage },
    });
  }

  console.log(
    `Done. Processed ${usersCreated} users, created ${pagesCreated} pages, skipped ${pagesSkipped} existing pages.`
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
