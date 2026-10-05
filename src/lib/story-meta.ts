export type StoryTheme = 'AI' | 'Web3' | 'Fintech' | 'Energy'

export type StoryRegion =
  | 'Hong Kong'
  | 'China'
  | 'India'
  | 'Japan'
  | 'Korea'
  | 'Singapore'
  | 'Taiwan'
  | 'Southeast Asia'
  | 'Asia'
  | 'United States'
  | 'United Kingdom'
  | 'Europe'
  | 'Africa'
  | 'Latin America'
  | 'Middle East'
  | 'Global'

const REGION_MATCHERS: { region: StoryRegion; needles: string[] }[] = [
  { region: 'Hong Kong', needles: ['hong kong', 'hongkong', 'hkt', 'hkma'] },
  { region: 'Singapore', needles: ['singapore', 'mas '] },
  { region: 'Taiwan', needles: ['taiwan', 'taipei'] },
  { region: 'Korea', needles: ['korea', 'korean', 'seoul'] },
  { region: 'Japan', needles: ['japan', 'japanese', 'tokyo'] },
  { region: 'India', needles: ['india', 'indian', 'mumbai', 'bengaluru', 'delhi'] },
  {
    region: 'Southeast Asia',
    needles: ['southeast asia', 'south-east asia', 'asean', 'indonesia', 'vietnam', 'thailand', 'malaysia', 'philippines', 'jakarta'],
  },
  { region: 'China', needles: ['china', 'chinese', 'beijing', 'shanghai', 'shenzhen', 'deepseek', 'alibaba', 'tencent', 'bytedance'] },
  { region: 'United Kingdom', needles: ['united kingdom', 'britain', 'london', 'uk government', 'uk regulator'] },
  { region: 'Europe', needles: ['european union', 'eu ai act', 'brussels', 'europe', 'european'] },
  { region: 'United States', needles: ['united states', 'u.s.', 'usa', 'washington', 'white house', 'silicon valley'] },
  { region: 'Africa', needles: ['africa', 'african', 'nigeria', 'kenya', 'south africa'] },
  { region: 'Latin America', needles: ['latin america', 'brazil', 'mexico', 'argentina'] },
  { region: 'Middle East', needles: ['middle east', 'uae', 'saudi', 'israel', 'dubai'] },
  { region: 'Asia', needles: ['asia', 'asian'] },
]

export function inferRegion(...parts: Array<string | null | undefined>): StoryRegion {
  const text = parts.filter(Boolean).join(' ').toLowerCase()
  for (const matcher of REGION_MATCHERS) {
    if (matcher.needles.some((needle) => text.includes(needle))) {
      return matcher.region
    }
  }
  return 'Global'
}

export function inferTheme(theme?: string | null, ...parts: Array<string | null | undefined>): StoryTheme {
  if (theme === 'Web3' || theme === 'Fintech' || theme === 'Energy' || theme === 'AI') {
    return theme
  }
  const text = [theme, ...parts].filter(Boolean).join(' ').toLowerCase()
  if (/(bitcoin|crypto|web3|blockchain|token)/.test(text)) return 'Web3'
  if (/(bank|fintech|payment|sec |regulation)/.test(text)) return 'Fintech'
  if (/(energy|oil|grid|climate|power)/.test(text)) return 'Energy'
  return 'AI'
}

export function readingMinutes(...parts: Array<string | null | undefined>): number {
  const words = parts
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function formatLongDate(date?: string | Date | null): string {
  if (!date) return ''
  const value =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)
      ? new Date(`${date.slice(0, 10)}T12:00:00+08:00`)
      : typeof date === 'string'
        ? new Date(date)
        : date
  if (Number.isNaN(value.getTime())) return ''
  return new Intl.DateTimeFormat('en-HK', {
    timeZone: 'Asia/Hong_Kong',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value)
}

export function formatWeekDisplay(week: string): string {
  if (/^[1-9]\d*$/.test(week)) return `Week ${week}`
  const [year, rest] = week.split('-W')
  return rest ? `Week ${Number(rest)} · ${year}` : week
}

export function hashSeed(seed: string): number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
