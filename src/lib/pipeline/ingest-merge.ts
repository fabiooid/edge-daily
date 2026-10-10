export type MergeableItem = {
  sourceId: string
  url: string
  title: string
  excerpt?: string | null
  bodyText?: string | null
  isSignal: boolean
  hnPoints?: number | null
  isPaywalled?: boolean
}

function maxPoints(left?: number | null, right?: number | null): number | null {
  const value = Math.max(left || 0, right || 0)
  return value > 0 ? value : null
}

/** Prefer an official row. HN only attaches points; it never owns the article. */
export function mergeOnCanonicalConflict(existing: MergeableItem, incoming: MergeableItem): MergeableItem {
  const hnPoints = maxPoints(existing.hnPoints, incoming.hnPoints)

  if (!incoming.isSignal && existing.isSignal) {
    return { ...incoming, isSignal: false, hnPoints }
  }

  if (incoming.isSignal && !existing.isSignal) {
    return { ...existing, hnPoints }
  }

  if (incoming.isSignal && existing.isSignal) {
    return { ...existing, hnPoints }
  }

  return {
    ...existing,
    hnPoints,
    excerpt: existing.excerpt || incoming.excerpt,
    bodyText: existing.bodyText || incoming.bodyText,
  }
}
