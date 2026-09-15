import type { Theme } from './theme.ts'

export function buildTopicPrompt(
  theme: Theme,
  approvedSources: string[],
  recentTitles: string[],
  postDate: string
) {
  const excludeClause =
    recentTitles.length > 0
      ? `These topics were already covered recently — do NOT suggest them:\n${recentTitles
          .map((t) => `  - "${t}"`)
          .join('\n')}\n\n`
      : ''

  const focus =
    theme === 'Energy'
      ? 'energy technology — electric vehicles, EV batteries, charging infrastructure, solar panels, wind turbines, grid-scale storage, clean energy startups, energy tech products and launches. Think: what would an engineer at Tesla, Rivian, or a utility-scale solar company want to read? AVOID geopolitical energy news, oil prices, gas supply crises, sanctions, or war-related energy stories.'
      : theme === 'AI'
        ? 'AI — prioritise announcements, product launches, model releases, and major moves from the key players: Anthropic, OpenAI, Google DeepMind/Gemini, Meta AI, Mistral, xAI. What have they shipped or announced this week? Only fall back to broader AI news if none of the key players have made a significant move.'
        : theme

  const weekAgo = new Date(new Date(postDate).getTime() - 7 * 864e5)
    .toISOString()
    .split('T')[0]

  return `${excludeClause}Today is ${postDate}. Search for the most interesting ${focus} news story published in the last 7 days (between ${weekAgo} and ${postDate}) that has coverage on these domains: ${approvedSources.join(', ')}.

The story MUST have been published or updated after ${weekAgo}. Do not pick stories older than 7 days.

Also search for what is currently trending on X (Twitter) in the ${focus} space today. Prefer topics that are generating active discussion on X right now, as they will resonate more with readers.

Pick ONE specific, newsworthy story.`
}

export function buildArticlePrompt(
  theme: Theme,
  topic: string,
  approvedSources: string[] | null,
  rejectedDomains: string[] = []
) {
  const rejectedClause =
    rejectedDomains.length > 0
      ? `\n- NEVER use links from these rejected domains: ${rejectedDomains.join(', ')}`
      : ''

  const sourceConstraint = approvedSources
    ? `- ONLY use links from these reputable sources: ${approvedSources.join(', ')}\n- Do not use any other domains`
    : `- Use links from reputable industry publications, company blogs, or official documentation\n- Avoid government databases, social media, or Wikipedia${rejectedClause}`

  return `Today is ${new Date().toISOString().split('T')[0]}. Write a tech news article about this story: "${topic}"

Search for real article URLs specifically covering this story. Only use articles published in the last 7 days — do not cite articles older than that.

Write for a reader who follows tech and business news but is not an expert. Assume basic familiarity. Write as a professional journalist from a news outlet like TechCrunch, Forbes, The Verge, or Wired. Never use em dashes (—).

CRITICAL REQUIREMENTS FOR LINKS:
- Include 2 or 3 links when possible (prefer exactly 3)
- Use ACTUAL URLs from your search results — never Google search links
- Every link must be directly and specifically about the SAME company, product, or event as the article — not just the same theme or industry
- If you cannot find 3 links about the exact story, use 2 or even 1 — do NOT pad with loosely related articles
${sourceConstraint}

Return structured data with title, content (2-3 paragraphs, 250-300 words), and links.`
}

export function buildRelevancePrompt(articleTitle: string, linkTitle: string) {
  return `Is this link directly about the same specific story, company, or product as the article titled "${articleTitle}"?

Link title: "${linkTitle}"

Reply with whether it is relevant.`
}
