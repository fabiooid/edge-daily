import { models } from '../../../config/models'
import type { CitationInput, StoryInput } from './checks'
import { isAsiaPlace, placeFromSourceRegion } from './place'
import type { RankedCluster } from './rank'
import type { StoryRegion } from '../story-meta'

export type WriteContext = {
  compileAt: Date
  mock?: boolean
}

function citationsFor(item: RankedCluster): CitationInput[] {
  const primaryUrl = item.url || `https://example.com/${item.id}`
  const citations: CitationInput[] = [
    {
      title: item.title,
      url: primaryUrl,
      isPrimary: true,
      publishedAt: item.publishedAt,
      isPaywalled: item.isPaywalled,
    },
  ]
  if (item.support) {
    citations.push({
      title: item.support.title,
      url: item.support.url,
      publishedAt: item.support.publishedAt,
      isPaywalled: item.support.isPaywalled,
    })
  }
  return citations
}

function mockStory(item: RankedCluster): StoryInput {
  const place = item.place || placeFromSourceRegion(item.region)
  const excerpt = item.excerpt?.trim()
  const body = excerpt
    ? `${item.title} is in this edition because it changes a plan, not because it filled a homepage. The publisher put a concrete change on the record this week. That is the bar.\n\n${excerpt}\n\nRead the primary source first. A second link is only here when another outlet covered the same launch. If the source does not say it, it does not belong here.`
    : `${item.title} is in this edition because it changes a plan, not because it filled a homepage. The publisher put a concrete change on the record this week. That is the bar.\n\nRead the primary source first. A second link is only here when another outlet covered the same launch. If the source does not say it, it does not belong here.\n\nThe take is simple. Treat this as local if it has a place. Treat it as a planning problem if it does not. Either way, brief people with the source in hand.`

  return {
    headline: item.title.replace(/—|–/g, '-'),
    body,
    whyItMatters: `If you work with AI in ${place}, this is not background noise. It changes what you can use, buy or ignore this week.`,
    asiaAngle: null,
    isAsia: isAsiaPlace(place),
    place,
    citations: citationsFor(item),
  }
}

export async function writeStories(picked: RankedCluster[], context: WriteContext): Promise<StoryInput[]> {
  if (context.mock) {
    return picked.map((item) => mockStory(item))
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is required to compile a real edition. Use --mock or --dry-run for a local demo.',
    )
  }

  const stories: StoryInput[] = []

  for (const item of picked) {
    const place: StoryRegion = item.place || placeFromSourceRegion(item.region)
    const support = item.support
    const prompt = `You are writing for Meridian, an opinionated weekly AI briefing. The line is: the AI week, wherever it lands.

Write one story for a smart non-specialist, anywhere in the world. Have a point of view. Do not write wire copy or a press-release restatement. Be specific about who should care and why. Stay inside the facts of the sources. Do not invent quotes, numbers, or motives.

Compile time: ${context.compileAt.toISOString()}
Place for this story (use this, do not guess another country from company names): ${place}
Primary source: ${item.title}
URL: ${item.url || 'unknown'}
Published: ${item.publishedAt?.toISOString() || 'unknown'}
Excerpt: ${item.excerpt || 'none provided'}
Second source (same launch, independent outlet): ${
      support
        ? `${support.title} | ${support.url} | ${support.excerpt || 'no excerpt'}`
        : 'none. Do not invent one.'
    }

Rules:
- Australian/British spelling
- No em dashes
- No hype words such as revolutionary, game-changing, or groundbreaking
- Headline with a take, not a bland summary
- Body: 2 to 4 short paragraphs, about 80 to 180 words. What happened, then what it means. Use only facts from the excerpts above.
- whyItMatters: 1 or 2 sentences for a reader in ${place}
- Return JSON with headline, body, whyItMatters, place (must be exactly "${place}")`

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
      asiaAngle: null,
      isAsia: isAsiaPlace(place),
      place,
      citations: citationsFor(item),
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
