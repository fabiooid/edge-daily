import { z } from 'zod'

export const linkSchema = z.object({
  title: z.string(),
  url: z.string(),
})

export const topicSchema = z.object({
  topic: z.string().describe('One-line headline describing the specific story'),
  context: z
    .string()
    .describe('1-2 sentences summarising what happened and why it matters'),
})

export const articleSchema = z.object({
  title: z.string(),
  content: z.string(),
  links: z.array(linkSchema).min(1).max(3),
})

export const relevanceSchema = z.object({
  relevant: z.boolean(),
})

export type Link = z.infer<typeof linkSchema>
export type Article = z.infer<typeof articleSchema>

export function cleanArticleText(text: string) {
  return text.replace(/\s*—\s*/g, ', ').trim()
}

export function assertValidArticleLinks(links: Link[]) {
  if (links.some((link) => link.url.includes('google.com/search'))) {
    throw new Error('Invalid links generated - contains Google search URLs')
  }
  if (links.length < 1) {
    throw new Error('Invalid number of links: 0')
  }
}
