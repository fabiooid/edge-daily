import { describe, expect, it } from 'vitest'
import {
  assertWritingKey,
  canReplaceEdition,
  liveEditionReason,
  writingKeyRequired,
} from '../src/lib/pipeline/compile-guard'

describe('live edition overwrite guard', () => {
  it('refuses to replace a published or in-review week without --force', () => {
    expect(canReplaceEdition('published')).toBe(false)
    expect(canReplaceEdition('in_review')).toBe(false)
    expect(canReplaceEdition('published', true)).toBe(true)
    expect(canReplaceEdition('in_review', true)).toBe(true)
  })

  it('allows replacing a draft or rejected week', () => {
    expect(canReplaceEdition('draft')).toBe(true)
    expect(canReplaceEdition('rejected')).toBe(true)
    expect(canReplaceEdition(undefined)).toBe(true)
  })

  it('explains why a live week was left alone', () => {
    expect(liveEditionReason('published')).toMatch(/refused to overwrite published/)
    expect(liveEditionReason('published')).toMatch(/--force/)
  })
})

describe('writing key', () => {
  it('is required unless mock or dry-run is set', () => {
    expect(writingKeyRequired({})).toBe(true)
    expect(writingKeyRequired({ mock: true })).toBe(false)
    expect(writingKeyRequired({ dryRun: true })).toBe(false)
  })

  it('refuses a real compile when the key is missing', () => {
    expect(() => assertWritingKey({ hasKey: false })).toThrow(/ANTHROPIC_API_KEY/)
    expect(() => assertWritingKey({ mock: true, hasKey: false })).not.toThrow()
    expect(() => assertWritingKey({ hasKey: true })).not.toThrow()
  })
})
