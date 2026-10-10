import { asc, desc, eq } from 'drizzle-orm'
import { getDb } from '../db'
import { citations, editionStories, editions } from '../db/schema'

export type EditionStoryView = {
  id: string
  slug: string
  position: number
  headline: string
  body: string
  whyItMatters: string
  asiaAngle: string | null
  isAsia: boolean
  place: string
  citations: { title: string; url: string; isPrimary: boolean }[]
}

export type EditionView = {
  id: string
  editionWeek: string
  status: string
  windowStart: Date
  windowEnd: Date
  publishedAt: Date | null
  lede: string[]
  stories: EditionStoryView[]
}

export async function getPublishedEditions(): Promise<EditionView[]> {
  const db = await getDb()
  const rows = await db
    .select()
    .from(editions)
    .where(eq(editions.status, 'published'))
    .orderBy(desc(editions.publishedAt), desc(editions.editionWeek))
  const views: EditionView[] = []
  for (const row of rows) {
    views.push(await hydrateEdition(row.id))
  }
  return views
}

export async function getLatestPublishedEdition(): Promise<EditionView | null> {
  const list = await getPublishedEditions()
  return list[0] || null
}

export async function getEditionByWeek(week: string, statuses: string[] = ['published']): Promise<EditionView | null> {
  const db = await getDb()
  const rows = await db.select().from(editions).where(eq(editions.editionWeek, week))
  const row = rows[0]
  if (!row || !statuses.includes(row.status)) return null
  return hydrateEdition(row.id)
}

export async function getEditionByPreviewToken(token: string): Promise<EditionView | null> {
  const db = await getDb()
  const rows = await db.select().from(editions).where(eq(editions.previewToken, token))
  if (!rows[0]) return null
  return hydrateEdition(rows[0].id)
}

async function hydrateEdition(editionId: string): Promise<EditionView> {
  const db = await getDb()
  const [edition] = await db.select().from(editions).where(eq(editions.id, editionId))
  const storyRows = await db
    .select()
    .from(editionStories)
    .where(eq(editionStories.editionId, editionId))
    .orderBy(asc(editionStories.position))
  const stories: EditionStoryView[] = []
  for (const story of storyRows) {
    const cites = await db.select().from(citations).where(eq(citations.editionStoryId, story.id))
    stories.push({
      id: story.id,
      slug: story.slug,
      position: story.position,
      headline: story.headline,
      body: story.body,
      whyItMatters: story.whyItMatters,
      asiaAngle: story.asiaAngle,
      isAsia: story.isAsia,
      place: story.place || 'Global',
      citations: cites.map((cite) => ({
        title: cite.title,
        url: cite.url,
        isPrimary: cite.isPrimary,
      })),
    })
  }
  return {
    id: edition.id,
    editionWeek: edition.editionWeek,
    status: edition.status,
    windowStart: edition.windowStart,
    windowEnd: edition.windowEnd,
    publishedAt: edition.publishedAt,
    lede: edition.lede || stories.slice(0, 5).map((story) => story.headline),
    stories,
  }
}
