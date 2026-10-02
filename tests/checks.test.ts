import { describe, expect, it } from 'vitest'
import {
  checkEditionShape,
  checkFreshness,
  checkSourceFloor,
  checkStyle,
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

  it('requires at least two Asia stories', () => {
    const result = checkEditionShape([goodStory, { ...goodStory, isAsia: false }])
    expect(result.passed).toBe(false)
    expect(result.detail).toMatch(/Asia/)
  })
})
