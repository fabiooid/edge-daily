export type Theme = 'AI' | 'Web3' | 'Fintech' | 'Energy'

export interface PostLink {
  title: string
  url: string
}

export interface Post {
  id: number | string
  slug: string
  theme: Theme
  title: string
  content: string
  links: PostLink[] | string
  date: string
}

export const THEMES: Theme[] = ['AI', 'Web3', 'Fintech', 'Energy']

export const THEME_EMOJIS: Record<Theme, string> = {
  AI: '🤖',
  Web3: '🌐',
  Fintech: '💳',
  Energy: '⚡',
}

export function themeLabel(theme: string): string {
  const emoji = THEME_EMOJIS[theme as Theme]
  return emoji ? `${emoji} ${theme}` : theme
}

export function formatPostDate(date?: string | null): string {
  if (!date) return ''
  return date.split('-').reverse().join('-')
}

export function getPostParagraphs(content?: string | null): string[] {
  return (content || '')
    .replace(/LINKS:[\s\S]*/i, '')
    .trim()
    .split('\n\n')
    .filter(Boolean)
}

export function getPostLinks(links: Post['links']): PostLink[] {
  if (Array.isArray(links)) return links
  try {
    const parsed = typeof links === 'string' ? JSON.parse(links) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getPostExcerpt(content?: string | null, maxLength = 150): string {
  const text = getPostParagraphs(content).join(' ')
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}
