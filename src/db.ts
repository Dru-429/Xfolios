import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "./generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = "postgresql://neondb_owner:npg_pKziN81AxPjf@ep-rapid-rain-b353bsyz-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured")
  }

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
