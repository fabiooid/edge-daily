import { describe, expect, it } from 'vitest'
import { isDroppedDeepSeek, isSeedDate, shouldImportArchivePost } from '../src/lib/archive'

describe('archive import rules', () => {
  it('skips seed dates and the DeepSeek post', () => {
    expect(isSeedDate('2026-02-23')).toBe(true)
    expect(isSeedDate('2026-03-09')).toBe(false)
    expect(
      isDroppedDeepSeek({
        slug: '5bc1451a',
        title: 'DeepSeek R1 Transforms Open Source AI',
        date: '2026-04-06',
      }),
    ).toBe(true)
    expect(
      shouldImportArchivePost({
        id: 42,
        theme: 'AI',
        title: 'DeepSeek R1 Transforms Open Source AI',
        content: '',
        links: '[]',
        date: '2026-04-06',
        created_at: '',
        slug: '5bc1451a',
      }),
    ).toBe(false)
    expect(
      shouldImportArchivePost({
        id: 26,
        theme: 'AI',
        title: 'NVIDIA Unveils Rubin Platform',
        content: '',
        links: '[]',
        date: '2026-03-09',
        created_at: '',
        slug: '337b0226',
      }),
    ).toBe(true)
  })
})
