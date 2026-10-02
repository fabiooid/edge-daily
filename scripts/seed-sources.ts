import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { huggingfaceOrgs } from '../config/huggingface-orgs'
import { xAccounts, xSearchQueries } from '../config/x'
import { parseCsv, slugId } from '../src/lib/csv'
import { closeDb, execSql } from '../src/lib/db'
import { mapSourceType, tierWeight } from '../src/lib/pipeline/sources/map-type'

function shouldActivate(row: Record<string, string>): boolean {
  if (row.top10_start === 'yes') return true
  if (row.name.includes('Hacker News (Algolia')) return true
  return false
}

async function main() {
  const csv = await readFile(path.join(process.cwd(), 'data/sources.csv'), 'utf8')
  const rows = parseCsv(csv)

  for (const row of rows) {
    if (row.category === 'Signal: X account') continue
    const type = mapSourceType(row.access, row.name)
    const id = slugId(row.name)
    const active = shouldActivate(row) && type !== 'x' && type !== 'scrape' && type !== 'email'
    const feedUrl = type === 'rss' || type === 'atom' ? row.url_or_endpoint : null
    const config =
      type === 'huggingface' && row.name.includes('org release')
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
        active ? 'active' : 'paused',
        row.paywall,
        row.reason,
        config,
      ],
    )
  }

  for (const account of xAccounts) {
    await execSql(
      `INSERT INTO x_accounts (handle, display_name, account_type, region, tier, status, notes)
       VALUES ($1,$2,$3,$4,$5,'paused',$6)
       ON CONFLICT (handle) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         account_type = EXCLUDED.account_type,
         region = EXCLUDED.region,
         tier = EXCLUDED.tier,
         status = 'paused'`,
      [
        account.handle,
        account.name,
        account.type,
        account.region,
        account.tier,
        'Seeded and disabled. Turn on FEATURE_X_SOURCES to use.',
      ],
    )
  }

  for (const [index, query] of xSearchQueries.entries()) {
    await execSql(
      `INSERT INTO x_queries (id, query, status) VALUES ($1,$2,'paused')
       ON CONFLICT (id) DO UPDATE SET query = EXCLUDED.query, status = 'paused'`,
      [`xq-${index + 1}`, query],
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

  console.log(`Seeded ${rows.length} source rows, ${xAccounts.length} X accounts, ${xSearchQueries.length} X queries`)
  await closeDb()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
