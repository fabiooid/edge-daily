export type Theme = 'AI' | 'Web3' | 'Fintech' | 'Energy'

const THEME_SCHEDULE: Record<number, Theme> = {
  1: 'AI',
  2: 'Web3',
  3: 'Fintech',
  4: 'Energy',
}

export function getHongKongDateString(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' })
}

export function getTodaysTheme(date = new Date()): Theme | null {
  const hkDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }))
  return THEME_SCHEDULE[hkDate.getDay()] ?? null
}
