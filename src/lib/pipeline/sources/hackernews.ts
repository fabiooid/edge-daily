import { hnAlgoliaUrl, hnQueries } from '../../../../config/hackernews'
import { parsePublishedDate } from '../window'
import type { IngestedItem, SourceAdapter } from './types'

type AlgoliaHit = {
  objectID: string
  title?: string
  url?: string
  points?: number
  created_at?: string
  created_at_i?: number
  num_comments?: number
}

export const hackernewsAdapter: SourceAdapter = {
  type: 'hackernews',
  async ingest(source, options) {
    if (options.mock) return []
    const since = Math.floor(options.since.getTime() / 1000)
    const seen = new Set<string>()
    const items: IngestedItem[] = []

    for (const query of hnQueries) {
      const url = new URL(hnAlgoliaUrl)
      url.searchParams.set('tags', 'story')
      url.searchParams.set('query', query.query)
      url.searchParams.set('numericFilters', `points>${query.minPoints},created_at_i>${since}`)
      url.searchParams.set('hitsPerPage', '30')
      const response = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'EdgeWeekly/1.0' },
      })
      if (!response.ok) continue
      const payload = (await response.json()) as { hits?: AlgoliaHit[] }
      for (const hit of payload.hits || []) {
        const articleUrl = hit.url
        if (!articleUrl || seen.has(articleUrl)) continue
        seen.add(articleUrl)
        items.push({
          sourceId: source.id,
          url: articleUrl,
          title: hit.title || 'Hacker News story',
          publishedAt: parsePublishedDate(hit.created_at || hit.created_at_i),
          excerpt: `${hit.points || 0} points, ${hit.num_comments || 0} comments on HN.`,
          isSignal: true,
          hnPoints: hit.points || 0,
        })
      }
    }
    return items
  },
}
