const APPROVABLE = new Set(['in_review', 'held', 'draft'])

export function canApproveEdition(input: { status: string; evalPassed: boolean }): {
  ok: boolean
  error?: string
} {
  if (!input.evalPassed) {
    return { ok: false, error: 'Blocking checks have not passed. Approve is disabled until they do.' }
  }
  if (!APPROVABLE.has(input.status)) {
    return { ok: false, error: 'This edition cannot be approved in its current state' }
  }
  return { ok: true }
}
