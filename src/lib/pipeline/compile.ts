import { and, desc, eq, gte, inArray, isNotNull, lte, ne } from 'drizzle-orm'
import { models } from '../../../config/models'
import { pipelineConfig } from '../../../config/pipeline'
import { getDb } from '../db'
import {
  approvals,
  citations,
  editionStories,
  editions,
  edits,
  evalResults,
  evalRuns,
  items,
  settings,
  sources,
  stories,
  storyItems,
} from '../db/schema'
import { hashId, id, previewToken, slugify } from '../ids'
import {
  decideCompileStatus,
  resolvePublishSettings,
  type HistoryEdition,
} from './auto-publish'
import { runBlockingChecks, sourceIsPaywalled, type StoryInput } from './checks'
import { buildStoryClusters, isRepeatStory } from './cluster'
import { assertWritingKey, canReplaceEdition, liveEditionReason } from './compile-guard'
import { isAsiaPlace, isStoredPlace, placeFromSourceRegion } from './place'
import { rankItems, pickTopStories, type RankableItem } from './rank'
import { writeStories } from './write'
import { freshnessWindow, hongKongDateParts, nextTuesdayEightHkt } from './window'
import { resolveMeridianWeek, snapshotIsoWeek } from './week'

export type CompileOptions = {
  mock?: boolean
  dryRun?: boolean
  publishDemo?: boolean
  compileAt?: Date
  allowShort?: boolean
  force?: boolean
}

export type CompileResult = {
  editionId: string
  editionWeek: string
  status: string
  previewToken: string
  storyCount: number
  headlines: string[]
  passed: boolean
  autoPublished: boolean
  publishReason: string
  unchanged?: boolean
  checks: { name: string; passed: boolean; detail: string }[]
}

async function loadPublishSettings() {
  try {
    const db = await getDb()
    const rows = await db.select().from(settings).where(eq(settings.key, 'publish'))
    return resolvePublishSettings(rows[0]?.value)
  } catch {
    return resolvePublishSettings()
  }
}

async function loadEditionHistory(editionWeek: string): Promise<HistoryEdition[]> {
  const db = await getDb()
  const rows = await db
    .select()
    .from(editions)
    .where(ne(editions.editionWeek, editionWeek))
    .orderBy(desc(editions.createdAt))

  const history: HistoryEdition[] = []
  for (const row of rows) {
    const [run] = await db
      .select()
      .from(evalRuns)
      .where(eq(evalRuns.editionId, row.id))
      .orderBy(desc(evalRuns.createdAt))
    const editRows = await db.select().from(edits).where(eq(edits.editionId, row.id))
    const changeRows = await db
      .select()
      .from(approvals)
      .where(and(eq(approvals.editionId, row.id), eq(approvals.action, 'request_changes')))
    history.push({
      evalPassed: Boolean(run?.passed),
      edited: editRows.length > 0 || changeRows.length > 0,
    })
  }
  return history
}

async function loadPriorHeadlines(compileAt: Date, currentWeek: string): Promise<string[]> {
  const db = await getDb()
  const cutoff = new Date(compileAt.getTime() - pipelineConfig.noveltyWeeks * 7 * 24 * 60 * 60 * 1000)
  const rows = await db
    .select({
      headline: editionStories.headline,
      editionWeek: editions.editionWeek,
      publishedAt: editions.publishedAt,
      status: editions.status,
    })
    .from(editionStories)
    .innerJoin(editions, eq(editionStories.editionId, editions.id))
    .where(eq(editions.status, 'published'))

  return rows
    .filter((row) => row.editionWeek !== currentWeek && row.publishedAt && row.publishedAt >= cutoff)
    .map((row) => row.headline)
}

export async function compileEdition(options: CompileOptions = {}): Promise<CompileResult> {
  const compileAt = options.compileAt || new Date()
  const window = freshnessWindow(compileAt)
  const db = await getDb()
  const hk = hongKongDateParts(compileAt)
  const isoWeek = hk.isoWeek
  const priorEditions = await db
    .select({
      editionWeek: editions.editionWeek,
      configSnapshot: editions.configSnapshot,
    })
    .from(editions)
  const editionWeek = resolveMeridianWeek(
    priorEditions.map((row) => ({
      editionWeek: row.editionWeek,
      isoWeek: snapshotIsoWeek(row.configSnapshot),
    })),
    isoWeek,
  )
  const existing = await db.select().from(editions).where(eq(editions.editionWeek, editionWeek))
  if (existing[0] && !canReplaceEdition(existing[0].status, Boolean(options.force))) {
    const savedStories = await db
      .select({ headline: editionStories.headline })
      .from(editionStories)
      .where(eq(editionStories.editionId, existing[0].id))
    return {
      editionId: existing[0].id,
      editionWeek,
      status: existing[0].status,
      previewToken: existing[0].previewToken,
      storyCount: savedStories.length,
      headlines: savedStories.map((story) => story.headline),
      passed: existing[0].status === 'published' || existing[0].status === 'in_review',
      autoPublished: false,
      publishReason: liveEditionReason(existing[0].status),
      unchanged: true,
      checks: [],
    }
  }

  assertWritingKey({
    mock: options.mock || options.dryRun,
    dryRun: options.dryRun,
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
  })

  const publishSettings = await loadPublishSettings()
  const mode = publishSettings.mode

  const rows = await db
    .select({
      item: items,
      source: sources,
    })
    .from(items)
    .innerJoin(sources, eq(items.sourceId, sources.id))
    .where(
      and(
        isNotNull(items.publishedAt),
        gte(items.publishedAt, window.start),
        lte(items.publishedAt, window.end),
      ),
    )

  const clusterable = rows
    .filter((row) => row.item.publishedAt)
    .map((row) => ({
      id: row.item.id,
      title: row.item.title,
      region: row.source.region,
      tier: row.source.tier,
      weight: row.source.weight,
      publishedAt: row.item.publishedAt,
      isSignal: row.item.isSignal,
      hnPoints: row.item.hnPoints,
      url: row.item.url,
      excerpt: row.item.excerpt,
      canonicalUrl: row.item.canonicalUrl,
      isPaywalled: row.item.isPaywalled || sourceIsPaywalled(row.source.paywall),
      sourceId: row.item.sourceId,
    }))

  const clustered = buildStoryClusters(clusterable)
  const priorHeadlines = await loadPriorHeadlines(compileAt, editionWeek)
  const novel = clustered.filter((item) => !isRepeatStory(item.title, priorHeadlines))
  const rankable: RankableItem[] = novel.map((item) => ({
    ...item,
    place: placeFromSourceRegion(item.region),
  }))

  const ranked = rankItems(rankable, compileAt)
  const picked = pickTopStories(ranked, pipelineConfig.maxStories)
  const drafted = await writeStories(picked, { compileAt, mock: options.mock || options.dryRun })

  const storiesWithRealLinks: StoryInput[] = drafted.map((story, index) => {
    const primary = picked[index]
    const support = primary?.support
    return {
      ...story,
      place: story.place || primary?.place,
      citations: [
        {
          title: primary?.title || story.citations[0]?.title || story.headline,
          url: primary?.url || story.citations[0]?.url || 'https://example.com',
          isPrimary: true,
          publishedAt: primary?.publishedAt || null,
          isPaywalled: primary?.isPaywalled,
        },
        support
          ? {
              title: support.title,
              url: support.url,
              publishedAt: support.publishedAt,
              isPaywalled: support.isPaywalled,
            }
          : null,
      ].filter((citation): citation is NonNullable<typeof citation> => Boolean(citation)),
    }
  })

  const checks = await runBlockingChecks(storiesWithRealLinks, window, {
    skipNetwork: Boolean(options.mock || options.dryRun),
    allowShort: options.allowShort,
  })

  const token = previewToken()
  const editionId = existing[0]?.id || hashId('ed', editionWeek)
  const history = await loadEditionHistory(editionWeek)
  const decision = options.publishDemo
    ? { status: 'published' as const, reason: 'demo publish', autoPublished: false }
    : decideCompileStatus({
        mode,
        killSwitch: publishSettings.killSwitch,
        checksPassed: checks.passed,
        autoFallbackToReview: publishSettings.autoFallbackToReview,
        autoRequires: publishSettings.autoRequires,
        history,
      })

  if (existing[0]) {
    const oldStories = await db
      .select({ id: editionStories.id })
      .from(editionStories)
      .where(eq(editionStories.editionId, existing[0].id))
    if (oldStories.length > 0) {
      await db.delete(citations).where(
        inArray(
          citations.editionStoryId,
          oldStories.map((row) => row.id),
        ),
      )
    }
    const oldRuns = await db
      .select({ id: evalRuns.id })
      .from(evalRuns)
      .where(eq(evalRuns.editionId, existing[0].id))
    if (oldRuns.length > 0) {
      await db.delete(evalResults).where(
        inArray(
          evalResults.evalRunId,
          oldRuns.map((row) => row.id),
        ),
      )
    }
    await db.delete(evalRuns).where(eq(evalRuns.editionId, existing[0].id))
    await db.delete(editionStories).where(eq(editionStories.editionId, existing[0].id))
  }

  const status = decision.status
  const publishedAt = status === 'published' ? compileAt : null
  const approvedBy = decision.autoPublished ? 'auto' : options.publishDemo ? 'demo' : null
  const approvedAt = status === 'published' ? compileAt : null

  await db
    .insert(editions)
    .values({
      id: editionId,
      editionWeek,
      windowStart: window.start,
      windowEnd: window.end,
      sendAt: nextTuesdayEightHkt(compileAt),
      status,
      modeUsed: mode,
      previewToken: existing[0]?.previewToken || token,
      lede: checks.surviving.slice(0, 5).map((story) => story.headline),
      publishedAt,
      approvedBy,
      approvedAt,
      configSnapshot: {
        models,
        freshnessDays: pipelineConfig.freshnessDays,
        mock: Boolean(options.mock || options.dryRun),
        isoWeek,
      },
    })
    .onConflictDoUpdate({
      target: editions.editionWeek,
      set: {
        windowStart: window.start,
        windowEnd: window.end,
        status,
        modeUsed: mode,
        lede: checks.surviving.slice(0, 5).map((story) => story.headline),
        publishedAt,
        approvedBy,
        approvedAt,
        configSnapshot: {
          models,
          freshnessDays: pipelineConfig.freshnessDays,
          mock: Boolean(options.mock || options.dryRun),
          isoWeek,
        },
      },
    })

  for (const [index, story] of checks.surviving.entries()) {
    const storyId = id('story')
    const editionStoryId = id('estory')
    const pickedItem = picked.find((item) => item.title === story.citations[0]?.title) || picked[index]
    const place = isStoredPlace(story.place)
      ? story.place
      : pickedItem?.place || placeFromSourceRegion(pickedItem?.region)
    await db.insert(stories).values({
      id: storyId,
      title: story.headline,
      summary: story.whyItMatters,
      status: 'selected',
    })
    if (pickedItem) {
      try {
        await db.insert(storyItems).values({
          storyId,
          itemId: pickedItem.id,
          role: 'primary',
        })
      } catch {
        // link is optional if the item row is missing in mock runs
      }
    }
    await db.insert(editionStories).values({
      id: editionStoryId,
      editionId,
      storyId,
      position: index + 1,
      section: 'main',
      isAsia: isAsiaPlace(place),
      place,
      slug: uniqueSlug(story.headline, index),
      headline: story.headline,
      body: story.body,
      whyItMatters: story.whyItMatters,
      asiaAngle: story.asiaAngle,
    })
    for (const [citationIndex, citation] of story.citations.entries()) {
      await db.insert(citations).values({
        id: id('cite'),
        editionStoryId,
        sentenceIndex: citationIndex,
        itemId: citationIndex === 0 ? pickedItem?.id : pickedItem?.support?.id,
        title: citation.title,
        url: citation.url,
        isPrimary: Boolean(citation.isPrimary),
      })
    }
  }

  const runId = id('eval')
  await db.insert(evalRuns).values({
    id: runId,
    editionId,
    stage: 'pre_approval',
    model: models.checks,
    passed: checks.passed,
    scoreTotal: String(checks.results.filter((result) => result.passed).length),
  })
  for (const result of checks.results) {
    await db.insert(evalResults).values({
      id: id('eres'),
      evalRunId: runId,
      checkName: result.name,
      blocking: result.blocking,
      passed: result.passed,
      detail: result.detail,
    })
  }

  const saved = await db.select().from(editions).where(eq(editions.id, editionId))
  return {
    editionId,
    editionWeek,
    status: saved[0]?.status || status,
    previewToken: saved[0]?.previewToken || token,
    storyCount: checks.surviving.length,
    headlines: checks.surviving.map((story) => story.headline),
    passed: checks.passed,
    autoPublished: decision.autoPublished,
    publishReason: decision.reason,
    checks: checks.results.map((result) => ({
      name: result.name,
      passed: result.passed,
      detail: result.detail,
    })),
  }
}

function uniqueSlug(headline: string, index: number): string {
  return `${slugify(headline) || 'story'}-${index + 1}`
}
