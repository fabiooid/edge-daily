import { canonicalUrl } from './dedupe'

export type SupportCandidate = {
  id: string
  title: string
  url?: string | null
  excerpt?: string | null
  publishedAt?: Date | null
  isSignal?: boolean
  isPaywalled?: boolean
}

export type IndependentSupport = {
  id: string
  title: string
  url: string
  excerpt?: string | null
  publishedAt: Date | null
  isPaywalled?: boolean
}

function hostOf(raw: string): string | null {
  try {
    return new URL(raw).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function sameHost(left: string, right: string): boolean {
  const a = hostOf(left)
  const b = hostOf(right)
  return Boolean(a && b && a === b)
}

/** Second source must be a different outlet and a different article, never HN-only. */
export function pickIndependentSupport(
  primary: { id: string; url?: string | null },
  candidates: SupportCandidate[],
): IndependentSupport | null {
  const primaryCanonical = primary.url ? canonicalUrl(primary.url) : null

  for (const candidate of candidates) {
    if (candidate.id === primary.id) continue
    if (candidate.isSignal) continue
    if (!candidate.url) continue
    const canonical = canonicalUrl(candidate.url)
    if (!canonical || (primaryCanonical && canonical === primaryCanonical)) continue
    if (primary.url && sameHost(primary.url, candidate.url)) continue
    return {
      id: candidate.id,
      title: candidate.title,
      url: candidate.url,
      excerpt: candidate.excerpt,
      publishedAt: candidate.publishedAt ?? null,
      isPaywalled: candidate.isPaywalled,
    }
  }

  return null
}
