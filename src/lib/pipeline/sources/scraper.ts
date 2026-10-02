import type { SourceAdapter } from './types'

/** Placeholder so a page-scraper type can be added later without changing the registry. */
export const scraperAdapter: SourceAdapter = {
  type: 'scrape',
  async ingest() {
    return []
  },
}

export const emailAdapter: SourceAdapter = {
  type: 'email',
  async ingest() {
    return []
  },
}

export const genericApiAdapter: SourceAdapter = {
  type: 'api',
  async ingest() {
    return []
  },
}
