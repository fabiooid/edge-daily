const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
])

export function canonicalUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    if (!['http:', 'https:'].includes(url.protocol)) return null
    url.hash = ''
    url.hostname = url.hostname.toLowerCase()
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4)
    }
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        url.searchParams.delete(key)
      }
    }
    url.pathname = url.pathname.replace(/\/+$/, '') || '/'
    url.searchParams.sort()
    return url.toString()
  } catch {
    return null
  }
}

export function isSearchResultUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'google.com' && url.pathname.startsWith('/search')) return true
    if (host === 'bing.com' && url.pathname.startsWith('/search')) return true
    if (host === 'duckduckgo.com') return true
    if (host === 'news.google.com') return true
    return false
  } catch {
    return true
  }
}

export function dedupeByCanonical<T extends { url: string }>(
  items: T[],
): Array<T & { canonicalUrl: string }> {
  const seen = new Set<string>()
  const out: Array<T & { canonicalUrl: string }> = []
  for (const item of items) {
    const canonical = canonicalUrl(item.url)
    if (!canonical || seen.has(canonical)) continue
    seen.add(canonical)
    out.push({ ...item, canonicalUrl: canonical })
  }
  return out
}
