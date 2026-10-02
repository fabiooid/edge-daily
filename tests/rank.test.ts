import { describe, expect, it } from 'vitest'
import { rankScore } from '../src/lib/pipeline/rank'

const compileAt = new Date('2026-10-06T10:00:00.000Z')

describe('HN ranking', () => {
  it('does not lower an Asia story when HN points are missing', () => {
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
