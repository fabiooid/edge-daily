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

  const asiaAngle = item.isAsia
    ? 'This is a regional story, so teams in Asia can treat it as a local product, policy or model move rather than distant US news.'
    : null

  return {
    headline: item.title.replace(/—|–/g, '-'),
    body: `${item.title} landed inside this week's window. The official account or publisher described a concrete change, not a rumour. We are using the primary link plus a second briefing so the facts can be checked.\n\nWhat is new is limited to what those sources state. Anything they do not say is left out.`,
    whyItMatters:
      'If you work with AI in Asia, this changes what you can use, buy or plan for this week. Read the sources before you brief anyone.',
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
    const prompt = `Write one Edge Weekly story for a smart non-specialist in Asia.
Compile time: ${context.compileAt.toISOString()}
Primary item: ${item.title} (${item.region}, ${item.tier})
Supporting items: ${supports.map((row) => row.title).join('; ') || 'none'}

Rules:
- Australian/British spelling
- No em dashes
- No hype words such as revolutionary or game-changing
- 2 or 3 short sentences for what happened
- A why it matters line of 1 or 2 sentences about people and organisations in Asia
- Asia angle only if the sources support it
- Return JSON with headline, body, whyItMatters, asiaAngle (string or null), isAsia (boolean)`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: models.writing,
        max_tokens: 800,
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
