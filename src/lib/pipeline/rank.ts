import { isAsiaRegion } from './sources/map-type'

export type RankableItem = {
  id: string
  title: string
  region: string
  tier: string
  weight: number
  publishedAt: Date | null
  isSignal: boolean
  hnPoints?: number | null
}

export type RankedCluster = RankableItem & {
  score: number
  isAsia: boolean
  hasGeographicStakes: boolean
}

const ASIA_HINTS = [
  'hong kong',
  'hkma',
  'china',
  'chinese',
  'deepseek',
  'qwen',
  'kimi',
  'glm',
  'minimax',
  'hunyuan',
  'japan',
  'korea',
  'singapore',
  'india',
  'sea-lion',
  'sarvam',
  'sakana',
  'asia',
]

const GEO_HINTS = [
  ...ASIA_HINTS,
  'europe',
  'european',
  'brussels',
  'united states',
  'u.s.',
  'washington',
  'white house',
  'britain',
  'united kingdom',
  'london',
  'africa',
  'nigeria',
  'kenya',
  'brazil',
  'mexico',
  'latin america',
  'middle east',
  'uae',
  'israel',
  'canada',
  'australia',
]

export function storyLooksAsian(title: string, region: string): boolean {
  if (isAsiaRegion(region)) return true
  const haystack = title.toLowerCase()
  return ASIA_HINTS.some((hint) => haystack.includes(hint))
}

export function hasGeographicStakes(title: string, region: string): boolean {
  if (storyLooksAsian(title, region)) return true
  const haystack = `${title} ${region}`.toLowerCase().trim()
  if (GEO_HINTS.some((hint) => haystack.includes(hint))) return true
  const value = region.toLowerCase().trim()
  if (!value || value === 'global') return false
  return true
}

/**
 * HN points can raise a score. Missing HN attention never lowers it.
 * Place tags do not add score; they only break ties.
 */
export function rankScore(item: RankableItem, compileAt: Date): number {
  let score = item.weight
  if (item.tier === 'core') score += 20
  if (item.tier === 'secondary') score += 8
  if (item.publishedAt) {
    const ageHours = (compileAt.getTime() - item.publishedAt.getTime()) / 36e5
    score += Math.max(0, 14 - ageHours / 12)
  }
  if (typeof item.hnPoints === 'number' && item.hnPoints > 0) {
    score += Math.min(20, item.hnPoints / 20)
  }
  if (item.isSignal) score -= 15
  return score
}

export function rankItems(items: RankableItem[], compileAt: Date): RankedCluster[] {
  return items
    .map((item) => ({
      ...item,
      isAsia: storyLooksAsian(item.title, item.region),
      hasGeographicStakes: hasGeographicStakes(item.title, item.region),
      score: rankScore(item, compileAt),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.hasGeographicStakes !== b.hasGeographicStakes) {
        return Number(b.hasGeographicStakes) - Number(a.hasGeographicStakes)
      }
      return 0
    })
}

export function pickTopStories(items: RankedCluster[], count = 6): RankedCluster[] {
  const picked: RankedCluster[] = []
  const used = new Set<string>()

  for (const item of items) {
    if (item.isSignal || used.has(item.id)) continue
    picked.push(item)
    used.add(item.id)
    if (picked.length >= count) break
  }
  return picked
}
