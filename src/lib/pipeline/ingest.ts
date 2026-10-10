import { eq } from 'drizzle-orm'
import { featureFlags } from '../../../config/pipeline'
import { getDb } from '../db'
import { items, sources } from '../db/schema'
import { hashId } from '../ids'
import { canonicalUrl } from './dedupe'
import { mergeOnCanonicalConflict } from './ingest-merge'
import { getAdapter } from './sources/registry'
import type { SourceRecord } from './sources/types'
import { freshnessWindow } from './window'

export type IngestResult = {
  fetched: number
  stored: number
  skipped: number
  errors: string[]
}

export async function ingestSources(options: { mock?: boolean; since?: Date } = {}): Promise<IngestResult> {
  const db = await getDb()
  const window = freshnessWindow(options.since || new Date())
  const rows = await db.select().from(sources)
  const errors: string[] = []
  let fetched = 0
  let stored = 0
  let skipped = 0

  for (const row of rows) {
    if (row.status !== 'active') continue
    if (row.type === 'x' && !featureFlags.xSources) continue

    const source: SourceRecord = {
      id: row.id,
      name: row.name,
      category: row.category,
      url: row.url,
      feedUrl: row.feedUrl,
      type: row.type as SourceRecord['type'],
      region: row.region,
      tier: row.tier,
      weight: row.weight,
      status: row.status as SourceRecord['status'],
      paywall: row.paywall,
      notes: row.notes,
      config: (row.config || {}) as Record<string, unknown>,
    }

    try {
      const adapter = getAdapter(source.type)
      const incoming = await adapter.ingest(source, { since: window.start, mock: options.mock })
      fetched += incoming.length
      for (const item of incoming) {
        const canonical = canonicalUrl(item.url)
        if (!canonical) {
          skipped += 1
          continue
        }
        const incomingRow = {
          sourceId: source.id,
          url: item.url,
          title: item.title,
          excerpt: item.excerpt,
          bodyText: item.bodyText,
          isPaywalled: item.isPaywalled || false,
          isSignal: item.isSignal || source.type === 'hackernews',
          hnPoints: item.hnPoints,
        }
        try {
          const existing = await db.select().from(items).where(eq(items.canonicalUrl, canonical)).limit(1)
          if (existing[0]) {
            const merged = mergeOnCanonicalConflict(
              {
                sourceId: existing[0].sourceId,
                url: existing[0].url,
                title: existing[0].title,
                excerpt: existing[0].excerpt,
                bodyText: existing[0].bodyText,
                isSignal: existing[0].isSignal,
                hnPoints: existing[0].hnPoints,
                isPaywalled: existing[0].isPaywalled,
              },
              incomingRow,
            )
            await db
              .update(items)
              .set({
                sourceId: merged.sourceId,
                url: merged.url,
                title: merged.title,
                excerpt: merged.excerpt,
                bodyText: merged.bodyText,
                isSignal: merged.isSignal,
                hnPoints: merged.hnPoints,
                isPaywalled: merged.isPaywalled || false,
              })
              .where(eq(items.id, existing[0].id))
            skipped += 1
            continue
          }

          await db.insert(items).values({
            id: hashId('item', canonical),
            sourceId: source.id,
            url: item.url,
            canonicalUrl: canonical,
            title: item.title,
            publishedAt: item.publishedAt,
            excerpt: item.excerpt,
            bodyText: item.bodyText,
            isPaywalled: item.isPaywalled || false,
            isSignal: incomingRow.isSignal,
            lang: item.lang,
            hnPoints: item.hnPoints,
          })
          stored += 1
        } catch {
          skipped += 1
        }
      }
      await db.update(sources).set({ lastOkAt: new Date(), lastError: null }).where(eq(sources.id, source.id))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${source.name}: ${message}`)
      await db.update(sources).set({ lastError: message }).where(eq(sources.id, source.id))
    }
  }

  return { fetched, stored, skipped, errors }
}
