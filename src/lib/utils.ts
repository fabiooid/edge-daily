import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWeekLabel(week: string): string {
  return week.replace('-W', ' week ')
}

export function formatPostDate(date?: string | Date | null): string {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10).split('-').reverse().join('-')
  }
  const value = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(value.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)
  const read = (type: string) => parts.find((part) => part.type === type)?.value || ''
  return `${read('day')}-${read('month')}-${read('year')}`
}

export function formatDate(value: Date | string): string {
  return formatPostDate(value)
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export const V1_THEMES = ['AI', 'Web3', 'Fintech', 'Energy'] as const

const THEME_EMOJIS: Record<string, string> = {
  AI: '🤖',
  Web3: '🌐',
  Fintech: '💳',
  Energy: '⚡',
}

export function themeLabel(theme: string): string {
  const emoji = THEME_EMOJIS[theme]
  return emoji ? `${emoji} ${theme}` : theme
}

export function getPostExcerpt(content?: string | null, maxLength = 150): string {
  const text = paragraphs(content || '').join(' ')
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}
