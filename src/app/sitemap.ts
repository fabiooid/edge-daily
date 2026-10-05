import type { MetadataRoute } from 'next'
import { siteUrl } from '../../config/site'
import { getPublishedEditions } from '@/lib/queries/editions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/archive`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  try {
    const editions = await getPublishedEditions()
    for (const edition of editions) {
      entries.push({
        url: `${base}/editions/${edition.editionWeek}`,
        lastModified: edition.publishedAt || undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
      for (const story of edition.stories) {
        entries.push({
          url: `${base}/editions/${edition.editionWeek}/${story.slug}`,
          lastModified: edition.publishedAt || undefined,
        })
      }
    }
  } catch {
    // sitemap still returns the static pages if the database is down
  }

  return entries
}
