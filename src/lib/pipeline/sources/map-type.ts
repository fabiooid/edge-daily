import type { SourceType } from './types'

export function mapSourceType(access: string, name: string): SourceType {
  const a = access.toLowerCase().trim()
  const n = name.toLowerCase()

  if (n.includes('hugging face org release')) return 'huggingface'
  if (n.includes('daily papers')) return 'huggingface_papers'
  if (n.includes('trending models')) return 'huggingface_trending'
  if (n.includes('algolia')) return 'hackernews'
  if (n.includes('hacker news') && a === 'api') return 'hackernews'
  if (a === 'rss') return 'rss'
  if (a === 'atom') return 'atom'
  if (a === 'x api' || a.startsWith('x ') || a === 'x') return 'x'
  if (a === 'scrape' || a.includes('scrape')) return 'scrape'
  if (a === 'email') return 'email'
  if (a === 'hf' || a === 'x + hf') return 'huggingface'
  if (a === 'api') return 'api'
  return 'api'
}

export function tierWeight(tier: string): number {
  if (tier === 'core') return 100
  if (tier === 'secondary') return 70
  return 40
}

export function isAsiaRegion(region: string): boolean {
  const value = region.toLowerCase()
  return [
    'hk',
    'cn',
    'jp',
    'kr',
    'in',
    'sea',
    'tw',
    'asia',
    'hong kong',
    'china',
    'japan',
    'korea',
    'india',
    'singapore',
    'southeast',
  ].some((token) => value.includes(token))
}
