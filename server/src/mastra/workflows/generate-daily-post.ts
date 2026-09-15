import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { topicAgent } from '../agents/topic-agent.ts'
import { writerAgent } from '../agents/writer-agent.ts'
import { relevanceAgent } from '../agents/relevance-agent.ts'
import {
  fetchApprovedSources,
  fetchRejectedDomains,
  suggestNewSources,
} from '../lib/airtable.ts'
import { runMastraEval } from '../lib/eval.ts'
import { buildArticlePrompt, buildRelevancePrompt, buildTopicPrompt } from '../lib/prompts.ts'
import {
  articleSchema,
  assertValidArticleLinks,
  cleanArticleText,
  linkSchema,
  relevanceSchema,
  topicSchema,
  type Article,
  type Link,
} from '../lib/schemas.ts'
import { getHongKongDateString, getTodaysTheme, type Theme } from '../lib/theme.ts'
import { validateLinks } from '../lib/validate-links.ts'
import { createPost, getAllPosts } from '../../../database.ts'

const workflowInputSchema = z.object({
  themeOverride: z.string().nullable().optional(),
  dateOverride: z.string().nullable().optional(),
})

const contextSchema = z.object({
  theme: z.enum(['AI', 'Web3', 'Fintech', 'Energy']),
  postDate: z.string(),
  approvedSources: z.array(z.string()),
  rejectedDomains: z.array(z.string()),
  recentTitles: z.array(z.string()),
})

const generatedSchema = contextSchema.extend({
  topic: z.string(),
  title: z.string(),
  content: z.string(),
  links: z.array(linkSchema),
  usedApprovedSources: z.boolean(),
})

const savedSchema = generatedSchema.extend({
  id: z.number(),
  slug: z.string(),
})

async function selectTopic(
  theme: Theme,
  approvedSources: string[],
  recentTitles: string[],
  postDate: string
) {
  const result = await topicAgent.generate(
    buildTopicPrompt(theme, approvedSources, recentTitles, postDate),
    {
      structuredOutput: { schema: topicSchema },
    }
  )

  const topic = result.object?.topic?.trim()
  if (!topic) throw new Error('Topic agent did not return a valid TOPIC')
  console.log(`🔍 Topic agent selected: "${topic}"`)
  return topic
}

async function generateArticle(
  theme: Theme,
  topic: string,
  approvedSources: string[] | null,
  rejectedDomains: string[]
): Promise<Article> {
  console.log(
    `✍️  Writer agent drafting${approvedSources ? ' (approved sources)' : ' (open sources)'}...`
  )

  const result = await writerAgent.generate(
    buildArticlePrompt(theme, topic, approvedSources, rejectedDomains),
    {
      structuredOutput: { schema: articleSchema },
    }
  )

  const article = result.object
  if (!article) throw new Error('Writer agent returned no article')

  const cleaned: Article = {
    title: cleanArticleText(article.title),
    content: cleanArticleText(article.content),
    links: article.links,
  }

  assertValidArticleLinks(cleaned.links)
  return cleaned
}

async function filterRelevantLinks(links: Link[], articleTitle: string) {
  const results = await Promise.all(
    links.map(async (link) => {
      try {
        const result = await relevanceAgent.generate(
          buildRelevancePrompt(articleTitle, link.title),
          {
            structuredOutput: { schema: relevanceSchema },
          }
        )
        const relevant = result.object?.relevant ?? true
        if (!relevant) console.log(`🚫 Dropping irrelevant link: "${link.title}"`)
        return relevant ? link : null
      } catch {
        return link
      }
    })
  )

  return results.filter(Boolean) as Link[]
}

const resolveContextStep = createStep({
  id: 'resolve-context',
  description: 'Resolve theme, date, sources, and recent titles',
  inputSchema: workflowInputSchema,
  outputSchema: contextSchema,
  execute: async ({ inputData }) => {
    const theme =
      (inputData.themeOverride as Theme | null | undefined) || getTodaysTheme()
    if (!theme) {
      throw new Error('No post scheduled for today')
    }

    const postDate = inputData.dateOverride || getHongKongDateString()
    console.log(`📅 Theme: ${theme}, Date: ${postDate}`)

    let approvedSources: string[] = []
    let rejectedDomains: string[] = []

    try {
      const sources = await fetchApprovedSources()
      approvedSources = sources[theme] || []
      rejectedDomains = await fetchRejectedDomains()
      if (rejectedDomains.length > 0) {
        console.log(`🚫 Blocking ${rejectedDomains.length} rejected domains`)
      }
    } catch (err) {
      console.warn(
        '⚠️ Airtable unavailable, continuing without source lists:',
        err instanceof Error ? err.message : err
      )
    }

    const allRecentPosts = await getAllPosts()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const recentTitles = allRecentPosts
      .filter((p) => new Date(p.date) >= cutoff)
      .map((p) => p.title)
      .filter((title): title is string => Boolean(title))

    if (recentTitles.length > 0) {
      console.log(
        `📚 Excluding ${recentTitles.length} recently covered topics (across all themes)`
      )
    }

    return {
      theme,
      postDate,
      approvedSources,
      rejectedDomains,
      recentTitles,
    }
  },
})

const generateArticleStep = createStep({
  id: 'generate-article',
  description: 'Select topic, write article, and gate links for quality',
  inputSchema: contextSchema,
  outputSchema: generatedSchema,
  execute: async ({ inputData }) => {
    const {
      theme,
      postDate,
      approvedSources,
      rejectedDomains,
      recentTitles,
    } = inputData

    let topic: string
    try {
      topic = await selectTopic(theme, approvedSources, recentTitles, postDate)
    } catch (err) {
      console.warn(
        `⚠️ Topic selection failed: ${err instanceof Error ? err.message : err}. Using open-ended prompt.`
      )
      topic = `a trending ${theme} development published in the last 7 days`
    }

    const MAX_TOPIC_ATTEMPTS = 2
    let topicAttempt = 0
    let title = ''
    let content = ''
    let links: Link[] = []
    let usedApprovedSources = true
    let generated = false

    while (!generated && topicAttempt < MAX_TOPIC_ATTEMPTS) {
      if (topicAttempt > 0) {
        console.log(
          `🔄 Not enough relevant links — picking a new topic (attempt ${topicAttempt + 1})...`
        )
        try {
          topic = await selectTopic(
            theme,
            approvedSources,
            [...recentTitles, title].filter(Boolean),
            postDate
          )
        } catch (err) {
          console.warn(
            `⚠️ Topic re-selection failed: ${err instanceof Error ? err.message : err}`
          )
        }
      }

      try {
        ;({ title, content, links } = await generateArticle(
          theme,
          topic,
          approvedSources.length > 0 ? approvedSources : null,
          rejectedDomains
        ))
        usedApprovedSources = approvedSources.length > 0
      } catch (err) {
        console.warn(
          `⚠️ Writer attempt failed: ${err instanceof Error ? err.message : err}`
        )
        usedApprovedSources = false
        console.warn('⚠️ Falling back to open sources...')
        ;({ title, content, links } = await generateArticle(
          theme,
          topic,
          null,
          rejectedDomains
        ))
      }

      console.log(`🔎 Checking link relevance for: "${title}"`)
      links = await filterRelevantLinks(links, title)
      console.log(`📎 ${links.length} relevant link(s) after quality check`)

      if (links.length >= 2) {
        generated = true
      } else {
        topicAttempt++
      }
    }

    if (links.length < 2) {
      throw new Error(
        `Could not find a story with sufficient coverage after ${MAX_TOPIC_ATTEMPTS} attempts`
      )
    }

    if (!usedApprovedSources) {
      console.warn(
        '⚠️ Post published using fallback (unapproved) sources — review Airtable'
      )
    }

    return {
      ...inputData,
      topic,
      title,
      content,
      links,
      usedApprovedSources,
    }
  },
})

const savePostStep = createStep({
  id: 'save-post',
  description: 'Validate links, save post, suggest sources, and kick off eval',
  inputSchema: generatedSchema,
  outputSchema: savedSchema,
  execute: async ({ inputData }) => {
    console.log('🔍 Validating links...')
    await validateLinks(inputData.links)
    console.log('✅ Links validated')

    const { id, slug } = await createPost(
      inputData.theme,
      inputData.title,
      inputData.content,
      inputData.links,
      inputData.postDate
    )

    console.log('\n✅ Post created with ID:', id)
    console.log('📝 Title:', inputData.title)
    console.log('🎯 Theme:', inputData.theme)

    await suggestNewSources(inputData.links, inputData.theme)

    // Fire-and-forget eval so publishing is not blocked
    void runMastraEval(
      {
        id,
        slug,
        theme: inputData.theme,
        title: inputData.title,
        content: inputData.content,
        links: inputData.links,
        date: inputData.postDate,
      },
      inputData.recentTitles
    ).catch((err) => console.error('Eval error:', err))

    return {
      ...inputData,
      id,
      slug,
    }
  },
})

export const generateDailyPostWorkflow = createWorkflow({
  id: 'generate-daily-post',
  description: 'Generate, validate, save, and evaluate the Edge Daily post',
  inputSchema: workflowInputSchema,
  outputSchema: savedSchema,
})
  .then(resolveContextStep)
  .then(generateArticleStep)
  .then(savePostStep)
  .commit()
