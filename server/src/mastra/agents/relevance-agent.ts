import { Agent } from '@mastra/core/agent'

export const relevanceAgent = new Agent({
  id: 'relevance-agent',
  name: 'Relevance Agent',
  instructions: `You judge whether a source link is about the exact same story, company, or product as an article title.
Be strict. Tangential industry coverage should be marked not relevant.`,
  model: 'anthropic/claude-haiku-4-5-20251001',
})
