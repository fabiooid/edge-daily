import { describe, expect, it } from 'vitest'
import {
  buildStoryClusters,
  isRepeatStory,
  titlesLookLikeSameLaunch,
} from '../src/lib/pipeline/cluster'

const publishedAt = new Date('2026-10-04T00:00:00.000Z')

describe('same-launch clustering', () => {
  it('groups the official post and HN chatter about the same launch', () => {
    const clusters = buildStoryClusters([
      {
        id: 'official',
        title: 'OpenAI ships a new API endpoint',
        region: 'Global (US)',
        tier: 'core',
        weight: 100,
        publishedAt,
        isSignal: false,
        url: 'https://openai.com/index/new-api',
        excerpt: 'Lower latency in Asia.',
      },
      {
        id: 'hn',
        title: 'OpenAI ships a new API endpoint',
        region: 'Global',
        tier: 'signal',
        weight: 40,
        publishedAt,
        isSignal: true,
        hnPoints: 300,
        url: 'https://openai.com/index/new-api?utm_source=hn',
      },
    ])

    expect(clusters).toHaveLength(1)
    expect(clusters[0]?.id).toBe('official')
    expect(clusters[0]?.isSignal).toBe(false)
    expect(clusters[0]?.hnPoints).toBe(300)
    expect(clusters[0]?.support).toBeNull()
  })

  it('keeps one story when two outlets cover the same launch, and keeps the other outlet as support', () => {
    const clusters = buildStoryClusters([
      {
        id: 'lab',
        title: 'Qwen releases a new open-weight model',
        region: 'CN',
        tier: 'core',
        weight: 100,
        publishedAt,
        isSignal: false,
        url: 'https://huggingface.co/Qwen/Qwen3',
        excerpt: 'Open weights this week.',
      },
      {
        id: 'newsroom',
        title: 'Qwen releases a new open-weight model for developers',
        region: 'CN, SEA',
        tier: 'core',
        weight: 100,
        publishedAt,
        isSignal: false,
        url: 'https://console.kr-asia.com/qwen-open-weight',
        excerpt: 'KrASIA coverage of the drop.',
      },
    ])

    expect(clusters).toHaveLength(1)
    expect(clusters[0]?.support?.id).toBe('newsroom')
    expect(clusters[0]?.support?.url).toContain('kr-asia.com')
  })

  it('does not merge two different launches', () => {
    expect(
      titlesLookLikeSameLaunch('OpenAI ships a new API', 'DeepMind publishes a new eval'),
    ).toBe(false)

    const clusters = buildStoryClusters([
      {
        id: 'us',
        title: 'OpenAI ships a new API',
        region: 'Global (US)',
        tier: 'core',
        weight: 100,
        publishedAt,
        isSignal: false,
        url: 'https://openai.com/index/api',
      },
      {
        id: 'uk',
        title: 'DeepMind publishes a new eval',
        region: 'Global (UK/US)',
        tier: 'core',
        weight: 90,
        publishedAt,
        isSignal: false,
        url: 'https://deepmind.google/blog/eval',
      },
    ])

    expect(clusters).toHaveLength(2)
  })

  it('drops a launch that already ran in a recent week', () => {
    expect(isRepeatStory('Qwen releases a new open-weight model', ['Qwen releases a new open-weight model'])).toBe(
      true,
    )
    expect(isRepeatStory('OpenAI ships a new API', ['Hong Kong opens an AI sandbox'])).toBe(false)
  })
})
