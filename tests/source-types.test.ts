import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pipelineConfig } from '../config/pipeline'
import { parseCsv } from '../src/lib/csv'
import { mapSourceType } from '../src/lib/pipeline/sources/map-type'
import { listAdapterTypes } from '../src/lib/pipeline/sources/registry'

describe('source types', () => {
  it('maps the vetted access values', () => {
    expect(mapSourceType('rss', 'OpenAI News')).toBe('rss')
    expect(mapSourceType('api', 'Hugging Face lab releases')).toBe('huggingface')
    expect(mapSourceType('api', 'Hacker News (Algolia search API)')).toBe('hackernews')
    expect(mapSourceType('x api', '@deepseek_ai (DeepSeek)')).toBe('x')
    expect(mapSourceType('scrape', 'Samsung Newsroom')).toBe('scrape')
  })

  it('registers a scraper type for later', () => {
    expect(listAdapterTypes()).toContain('scrape')
    expect(listAdapterTypes()).toContain('huggingface')
    expect(listAdapterTypes()).toContain('hackernews')
    expect(listAdapterTypes()).toContain('x')
  })

  it('ships a short hand-picked source list', () => {
    const rows = parseCsv(readFileSync('data/sources.csv', 'utf8'))
    expect(rows.length).toBeGreaterThanOrEqual(8)
    expect(rows.length).toBeLessThanOrEqual(pipelineConfig.maxHandPickedSources)
    expect(rows.every((row) => row.curated === 'yes')).toBe(true)
  })
})
