export type RawArchivePost = {
  id: number
  theme: string
  title: string
  content: string
  links: string
  date: string
  created_at: string
  slug: string
}

export const SEED_START = '2026-02-23'
export const SEED_END = '2026-03-05'
export const DROPPED_DEEPSEEK_SLUG = '5bc1451a'

export function isSeedDate(date: string): boolean {
  return date >= SEED_START && date <= SEED_END
}

export function isDroppedDeepSeek(post: Pick<RawArchivePost, 'slug' | 'title' | 'date'>): boolean {
  return (
    post.slug === DROPPED_DEEPSEEK_SLUG ||
    (post.date === '2026-04-06' && post.title.toLowerCase().includes('deepseek r1'))
  )
}

export function shouldImportArchivePost(post: RawArchivePost): boolean {
  if (isSeedDate(post.date)) return false
  if (isDroppedDeepSeek(post)) return false
  return true
}

export function parseArchiveLinks(raw: string): { title: string; url: string }[] {
  try {
    const parsed = JSON.parse(raw) as { title?: string; url?: string }[]
    return parsed
      .filter((link) => link.title && link.url)
      .map((link) => ({ title: link.title as string, url: link.url as string }))
  } catch {
    return []
  }
}
