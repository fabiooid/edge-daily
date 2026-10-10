import { placeFromSourceRegion } from './pipeline/place'

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

/** @deprecated Use a stored story.place. This only maps a source region string. */
export function inferRegion(...parts: Array<string | null | undefined>): StoryRegion {
  return placeFromSourceRegion(parts.find((part) => part && part.trim()) || '')
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
