import { pipelineConfig } from '../../../config/pipeline'

export type TimeWindow = {
  start: Date
  end: Date
}

export function freshnessWindow(compileAt: Date, days = pipelineConfig.freshnessDays): TimeWindow {
  return {
    start: new Date(compileAt.getTime() - days * 24 * 60 * 60 * 1000),
    end: compileAt,
  }
}

export function isWithinWindow(publishedAt: Date | null | undefined, window: TimeWindow): boolean {
  if (!publishedAt || Number.isNaN(publishedAt.getTime())) return false
  return publishedAt >= window.start && publishedAt <= window.end
}

export function parsePublishedDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'number') {
    const date = value < 1e12 ? new Date(value * 1000) : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export function hongKongDateParts(at = new Date()): {
  year: number
  month: number
  day: number
  weekday: number
  hour: number
  isoWeek: string
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at)

  const read = (type: string) => parts.find((part) => part.type === type)?.value || ''
  const year = Number(read('year'))
  const month = Number(read('month'))
  const day = Number(read('day'))
  const hour = Number(read('hour'))
  const weekdayName = read('weekday')
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return {
    year,
    month,
    day,
    weekday: weekdayMap[weekdayName] ?? at.getUTCDay(),
    hour,
    isoWeek: isoWeekFromYmd(year, month, day),
  }
}

export function isoWeekFromYmd(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month - 1, day))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function nextTuesdayEightHkt(from: Date): Date {
  const hk = hongKongDateParts(from)
  const asUtcGuess = Date.UTC(hk.year, hk.month - 1, hk.day, hk.hour - 8)
  const current = new Date(asUtcGuess)
  const daysUntilTuesday = (2 - hk.weekday + 7) % 7
  const target = new Date(current)
  target.setUTCDate(target.getUTCDate() + daysUntilTuesday)
  target.setUTCHours(0, 0, 0, 0)
  if (hk.weekday === 2 && hk.hour >= 8 && daysUntilTuesday === 0) {
    target.setUTCDate(target.getUTCDate() + 7)
  }
  return target
}
