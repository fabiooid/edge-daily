import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createPost, getAllPosts } from '../../../database.ts'
import { getHongKongDateString, getTodaysTheme, type Theme } from '../lib/theme.ts'
import { linkSchema } from '../lib/schemas.ts'

export const resolveThemeTool = createTool({
  id: 'resolve-theme',
  description: 'Resolve the Edge Daily theme and post date for generation',
  inputSchema: z.object({
    themeOverride: z.string().nullable().optional(),
    dateOverride: z.string().nullable().optional(),
  }),
  outputSchema: z.object({
    theme: z.enum(['AI', 'Web3', 'Fintech', 'Energy']).nullable(),
    postDate: z.string(),
    skipped: z.boolean(),
  }),
  execute: async ({ themeOverride, dateOverride }) => {
    const theme = (themeOverride as Theme | null | undefined) || getTodaysTheme()
    const postDate = dateOverride || getHongKongDateString()
    return {
      theme,
      postDate,
      skipped: !theme,
    }
  },
})

export const listRecentTitlesTool = createTool({
  id: 'list-recent-titles',
  description: 'List recent Edge Daily titles from the last 30 days',
  inputSchema: z.object({}),
  outputSchema: z.object({
    recentTitles: z.array(z.string()),
  }),
  execute: async () => {
    const allRecentPosts = await getAllPosts()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const recentTitles = allRecentPosts
      .filter((p) => new Date(p.date) >= cutoff)
      .map((p) => p.title)
      .filter((title): title is string => Boolean(title))

    return { recentTitles }
  },
})

export const savePostTool = createTool({
  id: 'save-post',
  description: 'Save a generated Edge Daily post to SQLite',
  inputSchema: z.object({
    theme: z.enum(['AI', 'Web3', 'Fintech', 'Energy']),
    title: z.string(),
    content: z.string(),
    links: z.array(linkSchema),
    postDate: z.string(),
  }),
  outputSchema: z.object({
    id: z.number(),
    slug: z.string(),
  }),
  execute: async ({ theme, title, content, links, postDate }) => {
    return createPost(theme, title, content, links, postDate)
  },
})
