import { describe, expect, it } from 'vitest'
import { isAsiaPlace, placeFromSourceRegion } from '../src/lib/pipeline/place'
import { storedPlace } from '../src/lib/story-view'
import { inferRegion } from '../src/lib/story-meta'

describe('stored place', () => {
  it('maps source regions to one place without scanning company names', () => {
    expect(placeFromSourceRegion('Global (US)')).toBe('United States')
    expect(placeFromSourceRegion('Global (UK/US)')).toBe('United Kingdom')
    expect(placeFromSourceRegion('Global (EU)')).toBe('Europe')
    expect(placeFromSourceRegion('HK, CN')).toBe('Hong Kong')
    expect(placeFromSourceRegion('CN')).toBe('China')
    expect(placeFromSourceRegion('SEA, Asia')).toBe('Southeast Asia')
    expect(placeFromSourceRegion('Global')).toBe('Global')
  })

  it('does not tag a US lab story as China because the write-up mentions DeepSeek', () => {
    expect(inferRegion('OpenAI answered DeepSeek with a smaller API')).toBe('Global')
    expect(storedPlace({ place: 'United States' })).toBe('United States')
    expect(storedPlace({ place: 'United States' })).not.toBe('China')
  })

  it('keeps Asia as one place among others, not a quota', () => {
    expect(isAsiaPlace('Hong Kong')).toBe(true)
    expect(isAsiaPlace('United States')).toBe(false)
    expect(isAsiaPlace('Europe')).toBe(false)
  })
})
