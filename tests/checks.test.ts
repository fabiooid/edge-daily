import { describe, expect, it } from 'vitest'
import {
  checkEditionShape,
  checkFreshness,
  checkLinksResolve,
  checkSourceFloor,
  checkStyle,
  isPaywallProtectedStatus,
  sourceIsPaywalled,
} from '../src/lib/pipeline/checks'
import { freshnessWindow } from '../src/lib/pipeline/window'

const compileAt = new Date('2026-10-06T10:00:00.000Z')
const window = freshnessWindow(compileAt, 7)

const fresh = new Date('2026-10-04T00:00:00.000Z')

const goodStory = {
  headline: 'Hong Kong opens an AI sandbox',
  body: 'The Digital Policy Office said a public sandbox is open this week for teams that want to test generative tools on government data. The note lists who can apply and what is out of scope. Nothing else is claimed.',
  whyItMatters: 'If you ship AI in Hong Kong, this is a concrete place to test a product with official cover.',
  isAsia: true,
  citations: [
    {
      title: 'Official note',
      url: 'https://www.digitalpolicy.gov.hk/en/news/sandbox',
      isPrimary: true,
      publishedAt: fresh,
    },
    {
      title: 'SCMP write-up',
      url: 'https://www.scmp.com/tech/sandbox',
      publishedAt: fresh,
    },
  ],
}

describe('blocking checks', () => {
  it('fails style on em dashes and hype words', () => {
    const result = checkStyle({
      ...goodStory,
      body: 'This is revolutionary — and it will change everything.',
    })
    expect(result.passed).toBe(false)
    expect(result.detail).toMatch(/em dash|banned phrase/)
  })

  it('fails source floor when HN-only or a single non-primary source is used', () => {
    const result = checkSourceFloor({
      ...goodStory,
      citations: [
        {
          title: 'HN thread',
          url: 'https://news.ycombinator.com/item?id=1',
          isSignal: true,
          publishedAt: fresh,
        },
      ],
    })
    expect(result.passed).toBe(false)
  })

  it('fails freshness when a cited item is older than 7 days', () => {
    const result = checkFreshness(
      {
        ...goodStory,
        citations: [
          {
            title: 'Old post',
            url: 'https://example.com/old',
            isPrimary: true,
            publishedAt: new Date('2026-09-01T00:00:00.000Z'),
          },
        ],
      },
      window,
    )
    expect(result.passed).toBe(false)
  })

  it('requires 5 to 7 stories, with no Asia quota', () => {
    const fiveGlobal = Array.from({ length: 5 }, () => ({ ...goodStory, isAsia: false }))
    expect(checkEditionShape(fiveGlobal).passed).toBe(true)

    const twoStories = [goodStory, { ...goodStory, isAsia: false }]
    const short = checkEditionShape(twoStories)
    expect(short.passed).toBe(false)
    expect(short.detail).toMatch(/only 2 stories/)
    expect(short.detail).not.toMatch(/Asia/)
  })

  it('treats 401/403 as ok only for a paywalled source', () => {
    expect(sourceIsPaywalled('partial')).toBe(true)
    expect(sourceIsPaywalled('freemium')).toBe(true)
    expect(sourceIsPaywalled('no')).toBe(false)
    expect(isPaywallProtectedStatus(403, true)).toBe(true)
    expect(isPaywallProtectedStatus(401, true)).toBe(true)
    expect(isPaywallProtectedStatus(404, true)).toBe(false)
    expect(isPaywallProtectedStatus(403, false)).toBe(false)
  })

  it('does not fail a paywalled citation on 403', async () => {
    const original = globalThis.fetch
    globalThis.fetch = (async () => new Response('paywall', { status: 403 })) as typeof fetch
    try {
      const result = await checkLinksResolve({
        ...goodStory,
        citations: [{ ...goodStory.citations[0], isPaywalled: true }],
      })
      expect(result.passed).toBe(true)
    } finally {
      globalThis.fetch = original
    }
  })
})
