import { atomAdapter, rssAdapter } from './rss'
import {
  huggingfaceAdapter,
  huggingfacePapersAdapter,
  huggingfaceTrendingAdapter,
} from './huggingface'
import { hackernewsAdapter } from './hackernews'
import { xAdapter } from './x'
import { emailAdapter, genericApiAdapter, scraperAdapter } from './scraper'
import type { SourceAdapter, SourceType } from './types'

const adapters: Record<SourceType, SourceAdapter> = {
  rss: rssAdapter,
  atom: atomAdapter,
  huggingface: huggingfaceAdapter,
  huggingface_papers: huggingfacePapersAdapter,
  huggingface_trending: huggingfaceTrendingAdapter,
  hackernews: hackernewsAdapter,
  x: xAdapter,
  scrape: scraperAdapter,
  email: emailAdapter,
  api: genericApiAdapter,
}

export function getAdapter(type: string): SourceAdapter {
  return adapters[type as SourceType] || genericApiAdapter
}

export function listAdapterTypes(): SourceType[] {
  return Object.keys(adapters) as SourceType[]
}
