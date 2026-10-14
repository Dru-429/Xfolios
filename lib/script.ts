import 'dotenv/config'

import { prisma } from '@/src/db'

const REQUEST_TIMEOUT_MS = 10_000
const CONCURRENCY = 5

type PageWithoutCover = {
  id: string
  websiteUrl: string
}

export async function backfillPageCoverUrls () {
  const pages = await prisma.page.findMany({
    where: { coverUrl: null },
    select: { id: true, websiteUrl: true }
  })

  console.log(`Found ${pages.length} pages without a cover URL.`)

  let nextIndex = 0
  let updated = 0
  let skipped = 0

  async function worker () {
    while (nextIndex < pages.length) {
      const page = pages[nextIndex++]
      await processPage(page)
    }
  }

  async function processPage (page: PageWithoutCover) {
    try {
      const coverUrl = await fetchOpenGraphImage(page.websiteUrl)

      if (!coverUrl) {
        skipped++
        console.warn(`[skip] No OG image: ${page.websiteUrl}`)
        return
      }

      const result = await prisma.page.updateMany({
        where: { id: page.id, coverUrl: null },
        data: { coverUrl }
      })

      if (result.count === 1) {
        updated++
        console.log(`[saved] ${page.websiteUrl} -> ${coverUrl}`)
      } else {
        skipped++
        console.log(`[skip] Cover already set: ${page.websiteUrl}`)
      }
    } catch (error) {
      skipped++
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[skip] ${page.websiteUrl}: ${message}`)
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, pages.length) },
      () => worker()
    )
  )

  console.log(`Finished. Updated ${updated}; skipped ${skipped}.`)
  return { found: pages.length, updated, skipped }
}

async function fetchOpenGraphImage (websiteUrl: string) {
  const response = await fetch(websiteUrl, {
    redirect: 'follow',
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Xfolios cover backfill/1.0'
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })

  if (!response.ok) {
    throw new Error(`Website returned HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error(`Expected HTML but received ${contentType || 'an unknown content type'}`)
  }

  const html = await response.text()
  const image =
    getMetaContent(html, 'og:image') ||
    getMetaContent(html, 'og:image:url') ||
    getMetaContent(html, 'og:image:secure_url') ||
    getMetaContent(html, 'twitter:image') ||
    getMetaContent(html, 'twitter:image:src')

  return image ? toHttpUrl(image, response.url || websiteUrl) : null
}

function getMetaContent (html: string, property: string) {
  const target = property.toLowerCase()
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []

  for (const tag of tags) {
    const attributes = new Map<string, string>()
    const attributePattern = /([\w:-]+)\s*=\s*(["'])(.*?)\2/g
    let match: RegExpExecArray | null

    while ((match = attributePattern.exec(tag))) {
      attributes.set(match[1].toLowerCase(), decodeHtmlAttribute(match[3]))
    }

    const key = (attributes.get('property') ?? attributes.get('name'))?.toLowerCase()
    if (key === target) return attributes.get('content')?.trim() ?? ''
  }

  return ''
}

function decodeHtmlAttribute (value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#38;', '&')
    .replaceAll('&#x26;', '&')
    .replaceAll('&quot;', '"')
}

function toHttpUrl (value: string, base: string) {
  try {
    const url = new URL(value, base)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null
  } catch {
    return null
  }
}

backfillPageCoverUrls()
  .catch(error => {
    console.error('Cover URL backfill failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })