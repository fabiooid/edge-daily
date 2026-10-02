import { closeDb, getDb } from '../src/lib/db'
import { items, sources } from '../src/lib/db/schema'
import { hashId } from '../src/lib/ids'
import { compileEdition } from '../src/lib/pipeline/compile'
import { eq } from 'drizzle-orm'

const DEMO_STORIES = [
  {
    sourceName: 'OpenAI News',
    title: 'OpenAI ships a smaller Asia-region API endpoint for lower latency',
    url: 'https://openai.com/index/asia-endpoint-demo',
    isAsia: false,
  },
  {
    sourceName: 'Google DeepMind Blog',
    title: 'DeepMind publishes a Gemini eval that includes Chinese and Japanese prompts',
    url: 'https://deepmind.google/blog/gemini-eval-asia-demo',
    isAsia: true,
  },
  {
    sourceName: 'SCMP Tech',
    title: 'Hong Kong Digital Policy Office opens a public generative AI sandbox',
    url: 'https://www.scmp.com/tech/hong-kong-ai-sandbox-demo',
    isAsia: true,
  },
  {
    sourceName: 'KrASIA',
    title: 'Qwen releases a new open-weight model aimed at Southeast Asian languages',
    url: 'https://console.kr-asia.com/qwen-sea-languages-demo',
    isAsia: true,
  },
  {
    sourceName: 'Rest of World',
    title: 'Indian hospitals start piloting clinic documentation tools on local models',
    url: 'https://restofworld.org/india-clinic-ai-demo',
    isAsia: true,
  },
  {
    sourceName: 'Tech in Asia',
    title: 'Singapore IMDA updates guidance for workplace use of generative AI',
    url: 'https://www.techinasia.com/imda-workplace-ai-demo',
    isAsia: true,
  },
  {
    sourceName: 'Recode China AI',
    title: 'MiniMax adds an agent API with published rate limits and safety notes',
    url: 'https://recodechinaai.substack.com/minimax-agent-api-demo',
    isAsia: true,
  },
]

async function main() {
  const db = await getDb()
  const compileAt = new Date()
  const publishedAt = new Date(compileAt.getTime() - 2 * 24 * 60 * 60 * 1000)

  for (const story of DEMO_STORIES) {
    const sourceRows = await db.select().from(sources)
    const source = sourceRows.find((row) => row.name === story.sourceName)
    if (!source) continue
    await db
      .insert(items)
      .values({
        id: hashId('item', story.url),
        sourceId: source.id,
        url: story.url,
        canonicalUrl: story.url,
        title: story.title,
        publishedAt,
        excerpt: story.title,
        isSignal: false,
      })
      .onConflictDoNothing()
  }

  const result = await compileEdition({
    mock: true,
    dryRun: true,
    publishDemo: true,
    compileAt,
    allowShort: false,
  })
  console.log(JSON.stringify(result, null, 2))
  await closeDb()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
