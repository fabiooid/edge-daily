import { models } from '../../../config/models'
import type { CitationInput, StoryInput } from './checks'
import type { RankedCluster } from './rank'

export type WriteContext = {
  compileAt: Date
  mock?: boolean
}

function mockStory(item: RankedCluster, extras: RankedCluster[]): StoryInput {
  const citations: CitationInput[] = [
    {
      title: item.title,
      url: `https://example.com/${item.id}`,
      isPrimary: true,
      publishedAt: item.publishedAt,
    },
  ]
  if (extras[0]) {
    citations.push({
      title: extras[0].title,
      url: `https://example.com/${extras[0].id}`,
      publishedAt: extras[0].publishedAt,
    })
  } else {
    citations.push({
      title: `${item.title} briefing`,
      url: `https://example.com/${item.id}-briefing`,
      publishedAt: item.publishedAt,
    })
  }

  const place = item.hasGeographicStakes ? item.region || 'this place' : 'wherever you work'
  const asiaAngle = item.isAsia
    ? 'Do not file this as distant news. It is a local product, policy or model move for teams on the ground.'
    : null

  return {
    headline: item.title.replace(/—|–/g, '-'),
    body: `${item.title} is in this edition because it changes a plan, not because it filled a homepage. The publisher put a concrete change on the record this week. That is the bar.\n\nRead the primary source first. The second link is only there so you can hear the same facts in another voice. If neither says it, it does not belong here.\n\nThe take is simple. Treat this as local if it has a place. Treat it as a planning problem if it does not. Either way, brief people with the source in hand.`,
    whyItMatters: `If you work with AI in ${place}, this is not background noise. It changes what you can use, buy or ignore this week.`,
    asiaAngle,
    isAsia: item.isAsia,
    citations,
  }
}

export async function writeStories(
  picked: RankedCluster[],
  all: RankedCluster[],
  context: WriteContext,
): Promise<StoryInput[]> {
  if (context.mock || !process.env.ANTHROPIC_API_KEY) {
    return picked.map((item, index) =>
      mockStory(
        item,
        all.filter((row) => row.id !== item.id).slice(index, index + 1),
      ),
    )
  }

  const stories: StoryInput[] = []

  for (const item of picked) {
    const supports = all.filter((row) => row.id !== item.id).slice(0, 3)
    const prompt = `You are writing for Meridian, an opinionated weekly AI briefing. The line is: the AI week, wherever it lands.

Write one story for a smart non-specialist, anywhere in the world. Have a point of view. Do not write wire copy or a press-release restatement. Be specific about who should care and why. Stay inside the facts of the sources. Do not invent quotes, numbers, or motives.

Compile time: ${context.compileAt.toISOString()}
Primary item: ${item.title} (${item.region}, ${item.tier})
Supporting items: ${supports.map((row) => row.title).join('; ') || 'none'}

Rules:
- Australian/British spelling
- No em dashes
- No hype words such as revolutionary, game-changing, or groundbreaking
- Headline with a take, not a bland summary
- Body: 2 to 4 short paragraphs, about 80 to 180 words. What happened, then what it means.
- whyItMatters: 1 or 2 sentences with a clear take for the reader where this story lands (country or region if the sources name one; otherwise a global reader)
- asiaAngle: a place-specific read only if the sources support it, else null
- Return JSON with headline, body, whyItMatters, asiaAngle (string or null), isAsia (boolean; true when the story has a clear Asia stake)`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: models.writing,
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!response.ok) {
      throw new Error(`Writer model failed: ${response.status}`)
    }
    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>
    }
    const text = (payload.content || []).map((block) => block.text || '').join('')
    const json = extractJson(text)
    stories.push({
      headline: String(json.headline || item.title).replace(/—|–/g, '-'),
      body: String(json.body || ''),
      whyItMatters: String(json.whyItMatters || ''),
      asiaAngle: json.asiaAngle ? String(json.asiaAngle) : null,
      isAsia: Boolean(json.isAsia) || item.isAsia,
      citations: [
        {
          title: item.title,
          url: `https://example.com/${item.id}`,
          isPrimary: true,
          publishedAt: item.publishedAt,
        },
        ...supports.slice(0, 1).map((row) => ({
          title: row.title,
          url: `https://example.com/${row.id}`,
          publishedAt: row.publishedAt,
        })),
      ],
    })
  }

  return stories
}

function extractJson(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return {}
  try {
    return JSON.parse(match[0]) as Record<string, unknown>
  } catch {
    return {}
  }
}
