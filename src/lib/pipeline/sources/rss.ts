import Parser from 'rss-parser'
import { parsePublishedDate } from '../window'
import type { IngestedItem, SourceAdapter } from './types'

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Meridian/1.0 (+https://meridian.example)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
})

export const rssAdapter: SourceAdapter = {
  type: 'rss',
  async ingest(source, options) {
    if (options.mock) return []
    if (!source.feedUrl) return []
    const feed = await parser.parseURL(source.feedUrl)
    return (feed.items || []).map((item) => ({
      sourceId: source.id,
      url: item.link || item.guid || '',
      title: item.title || 'Untitled',
      publishedAt: parsePublishedDate(item.isoDate || item.pubDate),
      excerpt: item.contentSnippet || item.summary || undefined,
      isPaywalled: source.paywall === 'yes' || source.paywall === 'partial (metered)',
    })).filter((item) => item.url)
  },
}

export const atomAdapter: SourceAdapter = {
  ...rssAdapter,
  type: 'atom',
}
