export function parseMeridianWeek(week: string): number | null {
  if (/^[1-9]\d*$/.test(week)) return Number(week)
  return null
}

export function nextMeridianWeek(existingWeeks: string[]): string {
  const numbers = existingWeeks
    .map(parseMeridianWeek)
    .filter((value): value is number => value != null)
  return String((numbers.length ? Math.max(...numbers) : 0) + 1)
}

export function resolveMeridianWeek(
  existing: { editionWeek: string; isoWeek: string | null }[],
  currentIsoWeek: string,
): string {
  const match = existing.find((row) => row.isoWeek === currentIsoWeek)
  if (match) return match.editionWeek
  return nextMeridianWeek(existing.map((row) => row.editionWeek))
}

export function snapshotIsoWeek(snapshot: Record<string, unknown> | null | undefined): string | null {
  const value = snapshot?.isoWeek
  return typeof value === 'string' && value.length > 0 ? value : null
}
