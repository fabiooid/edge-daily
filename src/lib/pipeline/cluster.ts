import { pickIndependentSupport, type IndependentSupport } from './citations'
import { canonicalUrl } from './dedupe'

const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'for',
  'to',
  'in',
  'on',
  'at',
  'by',
  'from',
  'with',
  'as',
  'is',
  'its',
  'new',
  'news',
  'blog',
])

export type ClusterableItem = {
  id: string
  title: string
  region: string
  tier: string
  weight: number
  publishedAt: Date | null
  isSignal: boolean
  hnPoints?: number | null
  url?: string | null
  excerpt?: string | null
  canonicalUrl?: string | null
  isPaywalled?: boolean
  sourceId?: string
}

export type StoryCluster = ClusterableItem & {
  hnPoints: number | null
  support: IndependentSupport | null
  members: ClusterableItem[]
}

export function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !STOP.has(token)),
  )
}

export function titlesLookLikeSameLaunch(left: string, right: string): boolean {
  const a = titleTokens(left)
  const b = titleTokens(right)
  if (a.size === 0 || b.size === 0) return false
  let shared = 0
  for (const token of a) {
    if (b.has(token)) shared += 1
  }
  if (shared >= 3) return true
  const smaller = Math.min(a.size, b.size)
  return shared >= 2 && shared / smaller >= 0.6
}

export function isRepeatStory(title: string, priorTitles: string[]): boolean {
  return priorTitles.some((prior) => titlesLookLikeSameLaunch(title, prior))
}

function itemKey(item: ClusterableItem): string | null {
  return item.canonicalUrl || (item.url ? canonicalUrl(item.url) : null)
}

export function clusterItems(items: ClusterableItem[]): ClusterableItem[][] {
  const groups: ClusterableItem[][] = []

  for (const item of items) {
    const key = itemKey(item)
    const match = groups.find((group) =>
      group.some((member) => {
        const memberKey = itemKey(member)
        if (key && memberKey && key === memberKey) return true
        return titlesLookLikeSameLaunch(item.title, member.title)
      }),
    )
    if (match) match.push(item)
    else groups.push([item])
  }

  return groups
}

function pickPrimary(members: ClusterableItem[]): ClusterableItem | null {
  const official = members.filter((member) => !member.isSignal)
  if (official.length === 0) return null
  return [...official].sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight
    if (a.tier === 'core' && b.tier !== 'core') return -1
    if (b.tier === 'core' && a.tier !== 'core') return 1
    return 0
  })[0]
}

export function buildStoryClusters(items: ClusterableItem[]): StoryCluster[] {
  const clusters: StoryCluster[] = []

  for (const members of clusterItems(items)) {
    const primary = pickPrimary(members)
    if (!primary) continue
    const hnPoints = Math.max(0, ...members.map((member) => member.hnPoints || 0))
    clusters.push({
      ...primary,
      isSignal: false,
      hnPoints: hnPoints > 0 ? hnPoints : primary.hnPoints || null,
      support: pickIndependentSupport(primary, members),
      members,
    })
  }

  return clusters
}
