import { describe, expect, it } from 'vitest'
import { nextMeridianWeek, parseMeridianWeek, resolveMeridianWeek } from '../src/lib/pipeline/week'

describe('Meridian week numbers', () => {
  it('starts at Week 1 when nothing has been published', () => {
    expect(nextMeridianWeek([])).toBe('1')
    expect(parseMeridianWeek('1')).toBe(1)
    expect(parseMeridianWeek('2026-W41')).toBeNull()
  })

  it('reuses the same Meridian week when compiling the same ISO week again', () => {
    expect(
      resolveMeridianWeek([{ editionWeek: '1', isoWeek: '2026-W41' }], '2026-W41'),
    ).toBe('1')
  })

  it('increments for a new ISO week and ignores leftover calendar-week keys', () => {
    expect(
      resolveMeridianWeek(
        [
          { editionWeek: '2026-W41', isoWeek: null },
          { editionWeek: '1', isoWeek: '2026-W41' },
        ],
        '2026-W42',
      ),
    ).toBe('2')
  })
})
