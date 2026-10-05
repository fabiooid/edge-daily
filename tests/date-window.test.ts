import { describe, expect, it } from 'vitest'
import { freshnessWindow, isWithinWindow, parsePublishedDate } from '../src/lib/pipeline/window'

describe('freshness window', () => {
  const compileAt = new Date('2026-10-06T10:00:00.000Z')
  const window = freshnessWindow(compileAt, 7)

  it('keeps items inside the 7-day window', () => {
    expect(isWithinWindow(new Date('2026-10-05T09:00:00.000Z'), window)).toBe(true)
    expect(isWithinWindow(new Date('2026-09-29T10:00:00.000Z'), window)).toBe(true)
  })

  it('drops items older than 7 days', () => {
    expect(isWithinWindow(new Date('2026-09-29T09:59:00.000Z'), window)).toBe(false)
    expect(isWithinWindow(new Date('2026-01-01T00:00:00.000Z'), window)).toBe(false)
  })

  it('drops items without a parseable date', () => {
    expect(isWithinWindow(null, window)).toBe(false)
    expect(parsePublishedDate('not a date')).toBeNull()
    expect(parsePublishedDate('')).toBeNull()
  })
})
