import { prisma } from '@/src/db'

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/pages/[pageId]/preview'>
) {
  const { pageId } = await params

  if (!UUID_PATTERN.test(pageId)) return new Response(null, { status: 404 })

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      websiteUrl: true,
      user: { select: { xAvatar: true } }
    }
  })

  if (!page) return new Response(null, { status: 404 })

  try {
    const response = await fetch(page.websiteUrl, {
      headers: { 'user-agent': 'Xfolios preview fetcher' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 }
    })

    if (response.ok) {
      const html = await response.text()
      const metadataImage =
        getMetaContent(html, 'og:image') ||
        getMetaContent(html, 'og:image:url') ||
        getMetaContent(html, 'twitter:image') ||
        getMetaContent(html, 'twitter:image:src')
      const imageUrl = metadataImage
        ? toHttpUrl(metadataImage, response.url || page.websiteUrl)
        : null

      if (imageUrl && !isSameImageUrl(imageUrl, page.user.xAvatar)) {
        return redirectToImage(imageUrl)
      }
    }
  } catch {
    // Microlink can still render sites that reject the metadata request.
  }

  const screenshotUrl = await getMicrolinkScreenshot(page.websiteUrl)
  if (screenshotUrl) {
    return redirectToImage(screenshotUrl)
  }

  return new Response(null, {
    status: 404,
    headers: { 'Cache-Control': CACHE_CONTROL }
  })
}

function getMetaContent(html: string, property: string) {
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

function decodeHtmlAttribute(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#38;', '&')
    .replaceAll('&#x26;', '&')
}

function toHttpUrl(value: string | null, base?: string) {
  if (!value) return null

  try {
    const url = new URL(value, base)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null
  } catch {
    return null
  }
}

function redirectToImage(url: string) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: url,
      'Cache-Control': CACHE_CONTROL
    }
  })
}

async function getMicrolinkScreenshot(portfolioUrl: string) {
  const requestUrl = getPreviewRequestUrl(portfolioUrl)
  if (!requestUrl) return null

  try {
    const response = await fetch(requestUrl, {
      signal: AbortSignal.timeout(20000),
      next: { revalidate: 604800 }
    })

    if (!response.ok) return null

    const payload: unknown = await response.json()
    const screenshotUrl = getScreenshotUrl(payload)
    return screenshotUrl ? toHttpUrl(screenshotUrl) : null
  } catch {
    return null
  }
}

function getPreviewRequestUrl(portfolioUrl: string) {
  try {
    const params = new URLSearchParams({
      url: portfolioUrl,
      screenshot: 'true',
      meta: 'false',
      'viewport.isMobile': 'false',
      'viewport.width': '1200',
      'viewport.height': '750'
    })

    return `https://api.microlink.io/?${params.toString()}`
  } catch {
    return null
  }
}

function getScreenshotUrl(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null

  const data = 'data' in payload && payload.data && typeof payload.data === 'object'
    ? payload.data
    : null
  const screenshot = data && 'screenshot' in data && data.screenshot &&
    typeof data.screenshot === 'object'
    ? data.screenshot
    : null

  if (
    screenshot &&
    'url' in screenshot &&
    typeof screenshot.url === 'string' &&
    screenshot.url.length > 0
  ) {
    return screenshot.url
  }

  return null
}

function isSameImageUrl(first: string, second: string | null) {
  if (!second) return false

  try {
    const imageIdentity = (value: string) => {
      const url = new URL(value)
      const pathname = decodeURIComponent(url.pathname).replace(
        /_(?:normal|bigger|mini|400x400)(?=\.[^.]+$)/i,
        ''
      )

      return `${url.hostname.toLowerCase()}${pathname}`
    }

    return imageIdentity(first) === imageIdentity(second)
  } catch {
    return first.trim() === second.trim()
  }
}
