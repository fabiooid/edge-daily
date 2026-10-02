export type SourceType =
  | 'rss'
  | 'atom'
  | 'huggingface'
  | 'huggingface_papers'
  | 'huggingface_trending'
  | 'hackernews'
  | 'x'
  | 'scrape'
  | 'email'
  | 'api'

export type SourceRecord = {
  id: string
  name: string
  category: string
  url: string | null
  feedUrl: string | null
  type: SourceType
  region: string
  tier: string
  weight: number
  status: 'active' | 'paused' | 'blocked'
  paywall: string | null
  notes: string | null
  config: Record<string, unknown>
}

export type IngestedItem = {
  sourceId: string
  url: string
  title: string
  publishedAt: Date | null
  excerpt?: string
  bodyText?: string
  isPaywalled?: boolean
  isSignal?: boolean
  lang?: string
  hnPoints?: number
}

export type SourceAdapter = {
  type: SourceType
  ingest(source: SourceRecord, options: { since: Date; mock?: boolean }): Promise<IngestedItem[]>
}
