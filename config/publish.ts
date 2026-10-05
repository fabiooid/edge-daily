export type PublishMode = 'manual' | 'auto'

export const publishDefaults = {
  mode: (process.env.PUBLISH_MODE === 'auto' ? 'auto' : 'manual') as PublishMode,
  autoRequires: {
    minEditions: 8,
    windowEditions: 8,
    minPassing: 7,
    maxEdited: 1,
    lastNClean: 3,
  },
  autoFallbackToReview: true,
  killSwitch: process.env.PUBLISH_KILL_SWITCH === 'true',
} as const

export function isAutoMode(mode: string | undefined): boolean {
  return mode === 'auto'
}
