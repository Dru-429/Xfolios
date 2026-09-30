const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const X_HANDLE_PATTERN = /^[a-z0-9_]{1,15}$/i

export function decodeRouteSegment (value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function normalizeXHandle (value: string) {
  return decodeRouteSegment(value).trim().replace(/^@+/, '').toLowerCase()
}

export function isXHandle (value: string) {
  return X_HANDLE_PATTERN.test(normalizeXHandle(value))
}

export function isUuid (value: string) {
  return UUID_PATTERN.test(decodeRouteSegment(value))
}

export function getProfileHref (handle: string) {
  return `/profile/${encodeURIComponent(normalizeXHandle(handle))}`
}
