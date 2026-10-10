import { describe, expect, it } from 'vitest'
import { mergeOnCanonicalConflict } from '../src/lib/pipeline/ingest-merge'

const official = {
  sourceId: 'openai-news',
  url: 'https://openai.com/index/new-api',
  title: 'OpenAI ships a new API',
  excerpt: 'Official note.',
  isSignal: false,
  hnPoints: null as number | null,
}

const hn = {
  sourceId: 'hacker-news-algolia-search-api',
  url: 'https://openai.com/index/new-api',
  title: 'OpenAI ships a new API',
  excerpt: '412 points on HN.',
  isSignal: true,
  hnPoints: 412,
}

describe('HN signal on official stories', () => {
  it('lets an official item take over a row HN stored first, and keeps the points', () => {
    const merged = mergeOnCanonicalConflict({ ...hn, hnPoints: 180 }, official)
    expect(merged.isSignal).toBe(false)
    expect(merged.sourceId).toBe('openai-news')
    expect(merged.hnPoints).toBe(180)
    expect(merged.excerpt).toBe('Official note.')
  })

  it('attaches later HN points to an official row instead of replacing it', () => {
    const merged = mergeOnCanonicalConflict(official, hn)
    expect(merged.isSignal).toBe(false)
    expect(merged.sourceId).toBe('openai-news')
    expect(merged.hnPoints).toBe(412)
    expect(merged.title).toBe('OpenAI ships a new API')
  })

  it('keeps the higher HN score when both rows are signal', () => {
    const merged = mergeOnCanonicalConflict({ ...hn, hnPoints: 50 }, { ...hn, hnPoints: 200 })
    expect(merged.isSignal).toBe(true)
    expect(merged.hnPoints).toBe(200)
  })
})
