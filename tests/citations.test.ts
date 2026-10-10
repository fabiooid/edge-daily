import { describe, expect, it } from 'vitest'
import { pickIndependentSupport } from '../src/lib/pipeline/citations'
import { writeStories } from '../src/lib/pipeline/write'
import type { RankedCluster } from '../src/lib/pipeline/rank'

describe('independent second source', () => {
  it('rejects the same article, the same host, and HN-only rows', () => {
    const primary = { id: 'lab', url: 'https://openai.com/index/new-api' }

    expect(
      pickIndependentSupport(primary, [
        { id: 'dup', title: 'Same article', url: 'https://openai.com/index/new-api?utm_source=rss' },
      ]),
    ).toBeNull()

    expect(
      pickIndependentSupport(primary, [
        { id: 'same-host', title: 'Another OpenAI post', url: 'https://openai.com/index/other' },
      ]),
    ).toBeNull()

    expect(
      pickIndependentSupport(primary, [
        {
          id: 'hn',
          title: 'HN thread',
          url: 'https://news.ycombinator.com/item?id=1',
          isSignal: true,
        },
      ]),
    ).toBeNull()
  })

  it('keeps a different outlet covering the same launch', () => {
    const support = pickIndependentSupport(
      { id: 'lab', url: 'https://openai.com/index/new-api' },
      [
        {
          id: 'scmp',
          title: 'SCMP on the API',
          url: 'https://www.scmp.com/tech/openai-api',
          excerpt: 'Hong Kong read.',
          publishedAt: new Date('2026-10-04T00:00:00.000Z'),
        },
      ],
    )
    expect(support?.id).toBe('scmp')
    expect(support?.url).toContain('scmp.com')
  })

  it('writes mock copy from the real excerpt and does not invent a roommate', async () => {
    const picked: RankedCluster[] = [
      {
        id: 'lab',
        title: 'OpenAI ships a new API',
        region: 'Global (US)',
        tier: 'core',
        weight: 100,
        publishedAt: new Date('2026-10-04T00:00:00.000Z'),
        isSignal: false,
        url: 'https://openai.com/index/new-api',
        excerpt: 'The company published a smaller endpoint this week.',
        place: 'United States',
        score: 120,
        isAsia: false,
        hasGeographicStakes: true,
        support: null,
      },
    ]

    const [story] = await writeStories(picked, { compileAt: new Date(), mock: true })
    expect(story.body).toContain('smaller endpoint')
    expect(story.citations).toHaveLength(1)
    expect(story.citations[0]?.url).toBe('https://openai.com/index/new-api')
    expect(story.place).toBe('United States')
  })
})
