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

export function storyLooksAsian(title: string, region: string): boolean {
  if (isAsiaRegion(region)) return true
  const haystack = title.toLowerCase()
  return ASIA_HINTS.some((hint) => haystack.includes(hint))
}

/**
 * HN points can raise a score. Missing HN attention never lowers it,
 * especially not for Asia stories.
 */
export function rankScore(item: RankableItem, compileAt: Date): number {
  let score = item.weight
  if (item.tier === 'core') score += 20
  if (item.tier === 'secondary') score += 8
  if (storyLooksAsian(item.title, item.region)) score += 25
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
      score: rankScore(item, compileAt),
    }))
    .sort((a, b) => b.score - a.score)
}

export function pickTopStories(items: RankedCluster[], count = 6): RankedCluster[] {
  const picked: RankedCluster[] = []
  const used = new Set<string>()

  const take = (candidate: RankedCluster) => {
    if (used.has(candidate.id)) return
    picked.push(candidate)
    used.add(candidate.id)
  }

  const asia = items.filter((item) => item.isAsia && !item.isSignal)
  const rest = items.filter((item) => !item.isSignal)

  for (const item of asia) {
    if (picked.filter((row) => row.isAsia).length >= 2) break
    take(item)
  }
  for (const item of rest) {
    if (picked.length >= count) break
    take(item)
  }
  return picked.slice(0, count)
}
