import { Agent } from '@mastra/core/agent'
import { z } from 'zod'

export const evalScoreSchema = z.object({
  relevance: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
  writing_quality: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
  clarity: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
  source_quality: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
  topic_freshness: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
  headline_quality: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
  social_resonance: z.object({ score: z.number().min(1).max(5), reason: z.string() }),
})

export const evalAgent = new Agent({
  id: 'eval-agent',
  name: 'Eval Agent',
  instructions: `You evaluate Edge Daily posts.
Score each criterion from 1 to 5 with a short reason.
Be consistent and strict about AI-sounding writing, vague headlines, and weak sources.`,
  model: 'anthropic/claude-haiku-4-5-20251001',
})
