import { compileEdition } from '../src/lib/pipeline/compile'
import { ingestSources } from '../src/lib/pipeline/ingest'
import { sendTelegramPreview } from '../src/lib/pipeline/telegram'
import { closeDb, getDb } from '../src/lib/db'
import { editions, editionStories } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`) || process.env.PIPELINE_MODE === name
}

function jobName(): string {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
  return process.env.PIPELINE_JOB || args[0] || 'help'
}

async function sendPreview(editionId: string, editionWeek: string, previewToken: string, passed: boolean) {
  const db = await getDb()
  const stories = await db.select().from(editionStories).where(eq(editionStories.editionId, editionId))
  const result = await sendTelegramPreview({
    editionWeek,
    storyCount: stories.length,
    headlines: stories.map((story) => story.headline),
    previewToken,
    passed,
  })
  if (!result.sent) {
    console.log(`Telegram preview not sent: ${result.reason}`)
  } else {
    console.log('Telegram preview sent')
  }
}

async function remind() {
  const db = await getDb()
  const rows = await db.select().from(editions).where(eq(editions.status, 'in_review'))
  for (const edition of rows) {
    await sendPreview(edition.id, edition.editionWeek, edition.previewToken, true)
  }
  if (rows.length === 0) console.log('No editions waiting for review')
}

async function main() {
  const job = jobName()
  const mock = flag('mock') || flag('dry-run') || !process.env.ANTHROPIC_API_KEY
  const dryRun = flag('dry-run')
  const publishDemo = flag('publish-demo')

  if (job === 'help' || job === '--help') {
    console.log(`Usage: tsx scripts/pipeline.ts <ingest|compile|remind|cron> [--mock] [--dry-run]

Railway cron: set PROCESS_ROLE=pipeline and PIPELINE_JOB=ingest|compile|remind
`)
    return
  }

  if (job === 'ingest') {
    const result = await ingestSources({ mock: dryRun })
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (job === 'compile') {
    const result = await compileEdition({ mock, dryRun, publishDemo })
    console.log(JSON.stringify(result, null, 2))
    if (!dryRun && !publishDemo && !result.autoPublished) {
      await sendPreview(result.editionId, result.editionWeek, result.previewToken, result.passed)
    } else if (result.autoPublished) {
      console.log(`Auto-published ${result.editionWeek}: ${result.publishReason}`)
    }
    return
  }

  if (job === 'remind') {
    await remind()
    return
  }

  if (job === 'cron') {
    const jobFromEnv = process.env.PIPELINE_JOB
    if (jobFromEnv) {
      process.argv.push(jobFromEnv)
      await main()
      return
    }
    throw new Error('PIPELINE_JOB is required for cron')
  }

  throw new Error(`Unknown job: ${job}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await closeDb()
  })
