export const pipelineConfig = {
  freshnessDays: 7,
  noveltyWeeks: 6,
  minStories: 5,
  maxStories: 7,
  shortEditionMin: 4,
  minSourcesPerStory: 2,
  bannedHypeWords: [
    'revolutionary',
    'game-changing',
    'game changing',
    'groundbreaking',
    'unlock the future',
    'change everything',
  ],
  blockedDomains: ['google.com/search', 'bing.com/search', 'duckduckgo.com'],
  compileWeekdayHkt: 1,
  compileHourHkt: 18,
  sendWeekdayHkt: 2,
  sendHourHkt: 8,
  maxHandPickedSources: 12,
} as const

export const featureFlags = {
  xSources: process.env.FEATURE_X_SOURCES === 'true',
} as const
