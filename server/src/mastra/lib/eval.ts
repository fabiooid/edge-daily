import { evalAgent, evalScoreSchema } from '../agents/eval-agent.ts'
import type { Link } from './schemas.ts'
import type { Theme } from './theme.ts'

export async function runMastraEval(
  post: {
    id?: number
    slug?: string
    theme: Theme
    title: string
    content: string
    links: Link[]
    date: string
  },
  recentTitles: string[] = []
) {
  console.log('🧪 Running Mastra eval for:', post.title)

  const wordCount = post.content.trim().split(/\s+/).length
  const hasEmDash = post.content.includes('—') || post.title.includes('—')
  const linksText = post.links
    .map((l, i) => `${i + 1}. ${l.title} - ${l.url}`)
    .join('\n')
  const recentContext =
    recentTitles.length > 0
      ? `\nRecently covered titles (for topic_freshness):\n${recentTitles
          .map((t) => `- ${t}`)
          .join('\n')}\n`
      : ''

  const prompt = `Score this Edge Daily post on each criterion from 1 to 5.

Criteria: relevance, writing_quality, clarity, source_quality, topic_freshness, headline_quality, social_resonance.
${recentContext}
POST TO EVALUATE:
Theme: ${post.theme}
Title: ${post.title}
Content: ${post.content}
Links:
${linksText}`

  const result = await evalAgent.generate(prompt, {
    structuredOutput: { schema: evalScoreSchema },
  })

  const scores = result.object
  if (!scores) throw new Error('Eval agent returned no scores')

  const overall =
    Object.values(scores).reduce((sum, c) => sum + c.score, 0) / 7
  console.log(`📊 Eval scores — Overall: ${overall.toFixed(1)}`)
  for (const [key, val] of Object.entries(scores)) {
    console.log(`   ${key}: ${val.score}/5 — ${val.reason}`)
  }
  console.log(`   Word count: ${wordCount} | Em dash: ${hasEmDash ? 'YES ⚠️' : 'no'}`)

  const baseId = process.env.AIRTABLE_BASE_ID
  const evalTableId = process.env.AIRTABLE_EVAL_TABLE_ID
  const token = process.env.AIRTABLE_TOKEN
  if (!baseId || !evalTableId || !token) {
    console.warn('⚠️ Skipping Airtable eval write — env not configured')
    return scores
  }

  await fetch(`https://api.airtable.com/v0/${baseId}/${evalTableId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        Date: post.date,
        Theme: post.theme,
        Title: post.title,
        Relevance: scores.relevance.score,
        'Relevance Notes': scores.relevance.reason,
        'Writing Quality': scores.writing_quality.score,
        'Writing Quality Notes': scores.writing_quality.reason,
        Clarity: scores.clarity.score,
        'Clarity Notes': scores.clarity.reason,
        'Source Quality': scores.source_quality.score,
        'Source Quality Notes': scores.source_quality.reason,
        'Topic Freshness': scores.topic_freshness.score,
        'Topic Freshness Notes': scores.topic_freshness.reason,
        'Headline Quality': scores.headline_quality.score,
        'Headline Quality Notes': scores.headline_quality.reason,
        'Social Resonance': scores.social_resonance.score,
        'Social Resonance Notes': scores.social_resonance.reason,
      },
    }),
  })

  return scores
}
