import { pipelineConfig } from '../../../config/pipeline'
import { isSearchResultUrl } from './dedupe'
import { isWithinWindow, type TimeWindow } from './window'

export type CitationInput = {
  title: string
  url: string
  isPrimary?: boolean
  publishedAt?: Date | null
  isSignal?: boolean
  domain?: string
}

export type StoryInput = {
  headline: string
  body: string
  whyItMatters: string
  asiaAngle?: string | null
  isAsia?: boolean
  citations: CitationInput[]
}

export type CheckResult = {
  name: string
  blocking: boolean
  passed: boolean
  detail: string
}

const HYPE = pipelineConfig.bannedHypeWords

export function checkStyle(story: StoryInput): CheckResult {
  const text = [story.headline, story.body, story.whyItMatters, story.asiaAngle || ''].join('\n')
  const problems: string[] = []
  if (text.includes('—') || text.includes('–')) {
    problems.push('contains em dash or en dash')
  }
  for (const word of HYPE) {
    if (text.toLowerCase().includes(word)) {
      problems.push(`banned phrase: ${word}`)
    }
  }
  if (!story.headline.trim()) problems.push('missing headline')
  if (!story.body.trim()) problems.push('missing body')
  if (!story.whyItMatters.trim()) problems.push('missing why it matters')
  const words = story.body.split(/\s+/).filter(Boolean).length
  if (words < 40) problems.push('body too short')
  if (words > 280) problems.push('body too long')
  return {
    name: 'style',
    blocking: true,
    passed: problems.length === 0,
    detail: problems.join('; ') || 'ok',
  }
}

export function checkSourceFloor(story: StoryInput, blockedDomains: string[] = []): CheckResult {
  const usable = story.citations.filter((citation) => !citation.isSignal)
  const problems: string[] = []
  if (usable.length === 0) problems.push('no citable sources')
  const hasPrimary = usable.some((citation) => citation.isPrimary)
  if (usable.length < pipelineConfig.minSourcesPerStory && !hasPrimary) {
    problems.push('need two sources or one primary source')
  }
  for (const citation of usable) {
    if (isSearchResultUrl(citation.url)) problems.push(`search result url: ${citation.url}`)
    const host = safeHost(citation.url)
    if (host && blockedDomains.some((blocked) => host.includes(blocked))) {
      problems.push(`blocked domain: ${host}`)
    }
  }
  return {
    name: 'source_floor',
    blocking: true,
    passed: problems.length === 0,
    detail: problems.join('; ') || 'ok',
  }
}

export function checkFreshness(story: StoryInput, window: TimeWindow): CheckResult {
  const problems: string[] = []
  for (const citation of story.citations.filter((citation) => !citation.isSignal)) {
    if (!isWithinWindow(citation.publishedAt ?? null, window)) {
      problems.push(`stale or undated citation: ${citation.title}`)
    }
  }
  return {
    name: 'freshness',
    blocking: true,
    passed: problems.length === 0,
    detail: problems.join('; ') || 'ok',
  }
}

export function checkEditionShape(
  stories: StoryInput[],
  options: { allowShort?: boolean } = {},
): CheckResult {
  const min = options.allowShort ? pipelineConfig.shortEditionMin : pipelineConfig.minStories
  const problems: string[] = []
  if (stories.length < min) problems.push(`only ${stories.length} stories`)
  if (stories.length > pipelineConfig.maxStories) problems.push(`too many stories: ${stories.length}`)
  const asiaCount = stories.filter((story) => story.isAsia).length
  if (asiaCount < pipelineConfig.minAsiaStories) {
    problems.push(`only ${asiaCount} Asia stories`)
  }
  return {
    name: 'edition_shape',
    blocking: true,
    passed: problems.length === 0,
    detail: problems.join('; ') || 'ok',
  }
}

export async function checkLinksResolve(
  story: StoryInput,
  options: { skipNetwork?: boolean } = {},
): Promise<CheckResult> {
  if (options.skipNetwork) {
    const problems = story.citations
      .filter((citation) => isSearchResultUrl(citation.url))
      .map((citation) => `search result url: ${citation.url}`)
    return {
      name: 'links_resolve',
      blocking: true,
      passed: problems.length === 0,
      detail: problems.join('; ') || 'skipped live fetch',
    }
  }

  const problems: string[] = []
  for (const citation of story.citations.filter((citation) => !citation.isSignal)) {
    if (isSearchResultUrl(citation.url)) {
      problems.push(`search result url: ${citation.url}`)
      continue
    }
    try {
      const response = await fetch(citation.url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'EdgeWeekly/1.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (response.status < 200 || response.status >= 400) {
        problems.push(`${citation.url} returned ${response.status}`)
      }
    } catch {
      problems.push(`${citation.url} failed to resolve`)
    }
  }
  return {
    name: 'links_resolve',
    blocking: true,
    passed: problems.length === 0,
    detail: problems.join('; ') || 'ok',
  }
}

export async function runBlockingChecks(
  stories: StoryInput[],
  window: TimeWindow,
  options: { skipNetwork?: boolean; allowShort?: boolean; blockedDomains?: string[] } = {},
): Promise<{ passed: boolean; results: CheckResult[]; surviving: StoryInput[] }> {
  const surviving: StoryInput[] = []
  const results: CheckResult[] = []

  for (const story of stories) {
    const storyResults = [
      checkStyle(story),
      checkSourceFloor(story, options.blockedDomains),
      checkFreshness(story, window),
      await checkLinksResolve(story, { skipNetwork: options.skipNetwork }),
    ]
    results.push(...storyResults)
    if (storyResults.every((result) => result.passed)) {
      surviving.push(story)
    }
  }

  const shape = checkEditionShape(surviving, { allowShort: options.allowShort })
  results.push(shape)
  return {
    passed: shape.passed && surviving.length > 0,
    results,
    surviving,
  }
}

function safeHost(raw: string): string | null {
  try {
    return new URL(raw).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
