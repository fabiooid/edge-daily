import { describe, expect, it } from 'vitest'
import { canApproveEdition } from '../src/lib/pipeline/approve'
import { buildPreviewMessage } from '../src/lib/pipeline/telegram'

describe('approve gate', () => {
  it('blocks approve when the latest checks failed', () => {
    expect(canApproveEdition({ status: 'draft', evalPassed: false })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/checks have not passed/i),
    })
  })

  it('allows approve only after checks passed', () => {
    expect(canApproveEdition({ status: 'in_review', evalPassed: true })).toEqual({ ok: true })
    expect(canApproveEdition({ status: 'published', evalPassed: true }).ok).toBe(false)
  })

  it('hides the Approve button when checks failed', () => {
    const failed = buildPreviewMessage({
      editionWeek: '1',
      storyCount: 3,
      headlines: ['One'],
      previewToken: 'preview',
      passed: false,
    })
    const labels = failed.buttons.flat().map((button) => button.text)
    expect(labels).not.toContain('Approve')
    expect(labels).toContain('Reject')
    expect(labels).toContain('Request changes')

    const passed = buildPreviewMessage({
      editionWeek: '1',
      storyCount: 5,
      headlines: ['One'],
      previewToken: 'preview',
      passed: true,
    })
    expect(passed.buttons.flat().map((button) => button.text)).toContain('Approve')
  })
})
