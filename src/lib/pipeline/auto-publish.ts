import { publishDefaults, type PublishMode } from '../../../config/publish'

export type AutoRequires = {
  minEditions: number
  windowEditions: number
  minPassing: number
  maxEdited: number
  lastNClean: number
}

export type HistoryEdition = {
  evalPassed: boolean
  edited: boolean
}

export type CompileStatus = 'published' | 'in_review' | 'draft'

export type PublishDecision = {
  status: CompileStatus
  reason: string
  autoPublished: boolean
}

export function historyMeetsAutoThresholds(
  history: HistoryEdition[],
  requires: AutoRequires,
): { ok: boolean; reason: string } {
  if (history.length < requires.minEditions) {
    return {
      ok: false,
      reason: `need ${requires.minEditions} prior editions, have ${history.length}`,
    }
  }

  const window = history.slice(0, requires.windowEditions)
  const passing = window.filter((row) => row.evalPassed).length
  if (passing < requires.minPassing) {
    return {
      ok: false,
      reason: `need ${requires.minPassing} passing in last ${requires.windowEditions}, have ${passing}`,
    }
  }

  const edited = window.filter((row) => row.edited).length
  if (edited > requires.maxEdited) {
    return {
      ok: false,
      reason: `too many edited editions in the window: ${edited}`,
    }
  }

  const clean = history.slice(0, requires.lastNClean)
  if (clean.length < requires.lastNClean || clean.some((row) => !row.evalPassed || row.edited)) {
    return {
      ok: false,
      reason: `last ${requires.lastNClean} editions were not clean`,
    }
  }

  return { ok: true, reason: 'eval thresholds met' }
}

export function decideCompileStatus(input: {
  mode: PublishMode | string
  killSwitch: boolean
  checksPassed: boolean
  autoFallbackToReview?: boolean
  autoRequires?: AutoRequires
  history: HistoryEdition[]
}): PublishDecision {
  if (!input.checksPassed) {
    return { status: 'draft', reason: 'blocking checks failed', autoPublished: false }
  }

  if (input.mode !== 'auto' || input.killSwitch) {
    return {
      status: 'in_review',
      reason: input.killSwitch ? 'kill switch on' : 'manual mode',
      autoPublished: false,
    }
  }

  const gate = historyMeetsAutoThresholds(input.history, input.autoRequires || publishDefaults.autoRequires)
  if (gate.ok) {
    return { status: 'published', reason: gate.reason, autoPublished: true }
  }

  if (input.autoFallbackToReview !== false) {
    return { status: 'in_review', reason: gate.reason, autoPublished: false }
  }

  return { status: 'draft', reason: gate.reason, autoPublished: false }
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function resolvePublishSettings(stored?: Record<string, unknown> | null) {
  const requires = (stored?.autoRequires || {}) as Record<string, unknown>
  const mode = stored?.mode === 'auto' || stored?.mode === 'manual' ? stored.mode : publishDefaults.mode
  return {
    mode,
    autoRequires: {
      minEditions: asNumber(requires.minEditions, publishDefaults.autoRequires.minEditions),
      windowEditions: asNumber(requires.windowEditions, publishDefaults.autoRequires.windowEditions),
      minPassing: asNumber(requires.minPassing, publishDefaults.autoRequires.minPassing),
      maxEdited: asNumber(requires.maxEdited, publishDefaults.autoRequires.maxEdited),
      lastNClean: asNumber(requires.lastNClean, publishDefaults.autoRequires.lastNClean),
    },
    autoFallbackToReview:
      typeof stored?.autoFallbackToReview === 'boolean'
        ? stored.autoFallbackToReview
        : publishDefaults.autoFallbackToReview,
    killSwitch: Boolean(stored?.killSwitch) || publishDefaults.killSwitch,
  }
}
