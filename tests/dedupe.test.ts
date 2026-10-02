import { describe, expect, it } from 'vitest'
import { canonicalUrl, dedupeByCanonical, isSearchResultUrl } from '../src/lib/pipeline/dedupe'

describe('canonical URL dedupe', () => {
  it('strips tracking params and trailing slashes', () => {
    expect(canonicalUrl('https://WWW.Example.com/news/story/?utm_source=x&utm_medium=y')).toBe(
      'https://example.com/news/story',
    )
  })

  it('keeps the first item when two URLs collapse', () => {
    const result = dedupeByCanonical([
      { url: 'https://example.com/a?utm_source=feed', title: 'one' },
      { url: 'https://www.example.com/a/', title: 'two' },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('one')
  })

  it('rejects search result URLs', () => {
    expect(isSearchResultUrl('https://www.google.com/search?q=ai')).toBe(true)
    expect(isSearchResultUrl('https://openai.com/news')).toBe(false)
  })
})
