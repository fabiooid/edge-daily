import { describe, expect, it } from 'vitest'
import { hasGeographicStakes, pickTopStories, rankItems, rankScore } from '../src/lib/pipeline/rank'

const compileAt = new Date('2026-10-06T10:00:00.000Z')

describe('HN ranking', () => {
  it('does not lower a story when HN points are missing', () => {
    const base = {
      id: '1',
      title: 'Qwen releases a new open-weight model',
      region: 'CN',
      tier: 'core',
      weight: 100,
      publishedAt: new Date('2026-10-04T00:00:00.000Z'),
      isSignal: false,
    }
    const withoutHn = rankScore(base, compileAt)
    const withZero = rankScore({ ...base, hnPoints: 0 }, compileAt)
    const withPoints = rankScore({ ...base, hnPoints: 300 }, compileAt)
    expect(withZero).toBe(withoutHn)
    expect(withPoints).toBeGreaterThan(withoutHn)
  })
})

describe('global selection', () => {
  it('does not boost Asia stories above otherwise equal global news', () => {
    const shared = {
      tier: 'core',
      weight: 100,
      publishedAt: new Date('2026-10-04T00:00:00.000Z'),
      isSignal: false,
    }
    const asia = rankScore({ ...shared, id: 'asia', title: 'Qwen ships a new model', region: 'CN' }, compileAt)
    const global = rankScore(
      { ...shared, id: 'global', title: 'OpenAI ships a new API', region: 'Global (US)' },
      compileAt,
    )
    expect(asia).toBe(global)
  })

  it('prefers a story with geographic stakes when scores tie', () => {
    const shared = {
      tier: 'core',
      weight: 100,
      publishedAt: new Date('2026-10-04T00:00:00.000Z'),
      isSignal: false,
    }
    const ranked = rankItems(
      [
        { ...shared, id: 'nowhere', title: 'A lab ships a new API', region: 'Global' },
        { ...shared, id: 'brussels', title: 'EU AI Act guidance lands in Brussels', region: 'Global (EU)' },
      ],
      compileAt,
    )
    expect(ranked[0]?.id).toBe('brussels')
    expect(hasGeographicStakes('EU AI Act guidance lands in Brussels', 'Global (EU)')).toBe(true)
  })

  it('picks the top worldwide stories with no Asia quota', () => {
    const publishedAt = new Date('2026-10-04T00:00:00.000Z')
    const ranked = rankItems(
      [
        {
          id: 'us',
          title: 'OpenAI ships a new API',
          region: 'Global (US)',
          tier: 'core',
          weight: 100,
          publishedAt,
          isSignal: false,
        },
        {
          id: 'uk',
          title: 'DeepMind publishes a new eval',
          region: 'Global (UK/US)',
          tier: 'core',
          weight: 90,
          publishedAt,
          isSignal: false,
        },
        {
          id: 'signal',
          title: 'HN chatter',
          region: 'Global',
          tier: 'signal',
          weight: 40,
          publishedAt,
          isSignal: true,
        },
        {
          id: 'hk',
          title: 'Hong Kong opens an AI sandbox',
          region: 'HK',
          tier: 'secondary',
          weight: 70,
          publishedAt,
          isSignal: false,
        },
      ],
      compileAt,
    )
    const picked = pickTopStories(ranked, 2)
    expect(picked.map((item) => item.id)).toEqual(['us', 'uk'])
    expect(picked.every((item) => !item.isSignal)).toBe(true)
  })
})
