import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { huggingfaceOrgs } from '../config/huggingface-orgs'
import { parseCsv, slugId } from '../src/lib/csv'
import { closeDb, execSql } from '../src/lib/db'
import { mapSourceType, tierWeight } from '../src/lib/pipeline/sources/map-type'

async function main() {
  const csv = await readFile(path.join(process.cwd(), 'data/sources.csv'), 'utf8')
  const rows = parseCsv(csv)
  const curatedIds: string[] = []

  for (const row of rows) {
    const type = mapSourceType(row.access, row.name)
    if (type === 'x' || type === 'scrape' || type === 'email') continue
    const id = slugId(row.name)
    curatedIds.push(id)
    const feedUrl = type === 'rss' || type === 'atom' ? row.url_or_endpoint : null
    const config =
      type === 'huggingface' && /hugging face/i.test(row.name)
        ? JSON.stringify({ orgs: [...huggingfaceOrgs] })
        : '{}'
    await execSql(
      `INSERT INTO sources (id, name, category, url, feed_url, type, region, tier, weight, status, paywall, notes, config)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         url = EXCLUDED.url,
         feed_url = EXCLUDED.feed_url,
         type = EXCLUDED.type,
         region = EXCLUDED.region,
         tier = EXCLUDED.tier,
         weight = EXCLUDED.weight,
         status = EXCLUDED.status,
         paywall = EXCLUDED.paywall,
         notes = EXCLUDED.notes,
         config = EXCLUDED.config`,
      [
        id,
        row.name,
        row.category,
        row.url_or_endpoint,
        feedUrl,
        type,
        row.region,
        row.tier,
        tierWeight(row.tier),
        'active',
        row.paywall,
        row.reason,
        config,
      ],
    )
  }

  if (curatedIds.length > 0) {
    const placeholders = curatedIds.map((_, index) => `$${index + 1}`).join(',')
    await execSql(
      `UPDATE sources SET status = 'paused' WHERE id NOT IN (${placeholders})`,
      curatedIds,
    )
  }

  await execSql(
    `INSERT INTO settings (key, value)
     VALUES ('publish', $1::jsonb)
     ON CONFLICT (key) DO NOTHING`,
    [
      JSON.stringify({
        mode: process.env.PUBLISH_MODE === 'auto' ? 'auto' : 'manual',
        autoRequires: {
          minEditions: 8,
          windowEditions: 8,
          minPassing: 7,
          maxEdited: 1,
          lastNClean: 3,
        },
        autoFallbackToReview: true,
        killSwitch: false,
      }),
    ],
  )

  console.log(`Seeded ${curatedIds.length} hand-picked sources. Anything else in the table is paused.`)
  await closeDb()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
