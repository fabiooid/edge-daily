const LIVE_STATUSES = new Set(['published', 'in_review'])

export function canReplaceEdition(status: string | undefined, force = false): boolean {
  if (!status) return true
  if (LIVE_STATUSES.has(status)) return force
  return true
}

export function liveEditionReason(status: string): string {
  return `refused to overwrite ${status} edition; pass --force to replace`
}

export function writingKeyRequired(options: { mock?: boolean; dryRun?: boolean }): boolean {
  return !options.mock && !options.dryRun
}

export function assertWritingKey(options: { mock?: boolean; dryRun?: boolean; hasKey: boolean }): void {
  if (writingKeyRequired(options) && !options.hasKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is required to compile a real edition. Use --mock or --dry-run for a local demo.',
    )
  }
}
