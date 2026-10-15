import 'dotenv/config'

import { prisma } from '@/src/db'

const BATCH_SIZE = 5
const REQUEST_TIMEOUT_MS = 12_000
const DASHBOARD_ORIGIN = getDashboardOrigin()

type PageRecord = {
  id: string
  userId: string
  websiteUrl: string
}

type CheckResult = PageRecord & {
  embeddable: boolean
  reason: string
}

export async function removePagesBlockedFromIframes () {
  const pages = await prisma.page.findMany({
    select: {
      id: true,
      userId: true,
      websiteUrl: true
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Checking ${pages.length} page URLs in batches of ${BATCH_SIZE}.`)
  console.log(
    DASHBOARD_ORIGIN
      ? `Dashboard origin: ${DASHBOARD_ORIGIN}`
      : 'Dashboard origin is not configured; checking only explicit frame blocks.'
  )

  const results: CheckResult[] = []

  for (let index = 0; index < pages.length; index += BATCH_SIZE) {
    const batch = pages.slice(index, index + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(checkPage))

    for (const result of batchResults) {
      results.push(result)
      console.log(
        `${result.embeddable ? 'OK' : 'BLOCK'} ${result.websiteUrl} — ${result.reason}`
      )
    }
  }

  const embeddable = results.filter(result => result.embeddable)
  const blocked = results.filter(result => !result.embeddable)

  printList('Embeddable', embeddable)
  printList('Blocked', blocked)

  if (blocked.length === 0) {
    console.log('No blocked pages to delete.')
    return { checked: results.length, embeddable: embeddable.length, blocked: 0, deleted: 0 }
  }

  const blockedPageIds = blocked.map(result => result.id)
  const affectedUserIds = [...new Set(blocked.map(result => result.userId))]
  const deletion = await prisma.page.deleteMany({
    where: { id: { in: blockedPageIds } }
  })

  await Promise.all(
    affectedUserIds.map(async userId => {
      const totalPage = await prisma.page.count({ where: { userId } })
      await prisma.user.update({
        where: { id: userId },
        data: { totalPage }
      })
    })
  )

  console.log(`Deleted ${deletion.count} blocked pages from the database.`)

  return {
    checked: results.length,
    embeddable: embeddable.length,
    blocked: blocked.length,
    deleted: deletion.count
  }
}

async function checkPage (page: PageRecord): Promise<CheckResult> {
  try {
    const response = await fetch(page.websiteUrl, {
      redirect: 'follow',
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'Mozilla/5.0 (compatible; XfoliosEmbedChecker/1.0)'
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })

    if (!response.ok) {
      await response.body?.cancel()
      return blockedResult(page, `HTTP ${response.status}`)
    }

    const xFrameOptions = response.headers.get('x-frame-options')
    const xFrameBlock = getXFrameOptionsBlockReason(xFrameOptions)

    if (xFrameBlock) {
      await response.body?.cancel()
      return blockedResult(page, xFrameBlock)
    }

    const contentSecurityPolicy = response.headers.get('content-security-policy')
    const cspBlock = getCspBlockReason(contentSecurityPolicy, DASHBOARD_ORIGIN)
    await response.body?.cancel()

    if (cspBlock) {
      return blockedResult(page, cspBlock)
    }

    return {
      ...page,
      embeddable: true,
      reason: 'no blocking frame headers'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return blockedResult(page, `request failed: ${message}`)
  }
}

function getXFrameOptionsBlockReason (header: string | null) {
  if (!header) return null

  const blockingValue = header
    .split(',')
    .map(value => value.trim())
    .find(value => /^(?:DENY|SAMEORIGIN)(?:\s|$)|^ALLOW-FROM(?:\s|$)/i.test(value))

  return blockingValue
    ? `X-Frame-Options: ${blockingValue}`
    : null
}

function getCspBlockReason (
  header: string | null,
  dashboardOrigin: URL | null
) {
  if (!header) return null

  const directives = [...header.matchAll(/(?:^|[;,])\s*frame-ancestors(?:\s+([^;,]*))?/gi)]
  if (directives.length === 0) return null

  for (const directive of directives) {
    const value = directive[1]?.trim() ?? ''
    const sources = value.split(/\s+/).filter(Boolean)
    const normalizedSources = sources.map(source => source.toLowerCase())

    if (sources.length === 0) {
      return 'CSP frame-ancestors is empty'
    }

    if (normalizedSources.includes("'none'")) {
      return "CSP frame-ancestors 'none'"
    }

    if (sources.length === 1 && normalizedSources[0] === "'self'") {
      return "CSP frame-ancestors 'self'"
    }

    if (
      dashboardOrigin &&
      !sources.some(source => sourceAllowsOrigin(source, dashboardOrigin))
    ) {
      return `CSP frame-ancestors does not allow ${dashboardOrigin.origin}`
    }
  }

  return null
}

function sourceAllowsOrigin (source: string, dashboardOrigin: URL) {
  const normalized = source.trim().replace(/^['"]|['"]$/g, '').toLowerCase()

  if (normalized === '*') return true
  if (normalized === `${dashboardOrigin.protocol}`) return true

  try {
    const sourceUrl = new URL(normalized)
    if (sourceUrl.origin === dashboardOrigin.origin) return true

    if (sourceUrl.hostname.startsWith('*.')) {
      const baseDomain = sourceUrl.hostname.slice(2)
      return (
        sourceUrl.protocol === dashboardOrigin.protocol &&
        dashboardOrigin.hostname.endsWith(`.${baseDomain}`)
      )
    }
  } catch {
    if (normalized === dashboardOrigin.hostname) return true

    if (normalized.startsWith('*.')) {
      return dashboardOrigin.hostname.endsWith(`.${normalized.slice(2)}`)
    }
  }

  return false
}

function getDashboardOrigin () {
  const configuredUrl =
    process.env.DASHBOARD_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL

  if (!configuredUrl) return null

  try {
    return new URL(configuredUrl)
  } catch {
    throw new Error(`Invalid dashboard URL: ${configuredUrl}`)
  }
}

function blockedResult (page: PageRecord, reason: string): CheckResult {
  return { ...page, embeddable: false, reason }
}

function printList (title: string, results: CheckResult[]) {
  console.log(`\n${title} (${results.length})`)

  if (results.length === 0) {
    console.log('  (none)')
    return
  }

  for (const result of results) {
    console.log(`  - ${result.websiteUrl}${result.embeddable ? '' : ` — ${result.reason}`}`)
  }
}

removePagesBlockedFromIframes()
  .catch(error => {
    console.error('Iframe compatibility check failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
