import { Agent } from '@mastra/core/agent'
import { webSearchTool } from '@mastra/core/tools'

export const topicAgent = new Agent({
  id: 'topic-agent',
  name: 'Topic Agent',
  instructions: `You pick one specific, newsworthy tech story for Edge Daily.
Use web search. Prefer recent coverage on the provided approved domains.
Respond with a concise topic headline and short context only.`,
  model: 'anthropic/claude-haiku-4-5-20251001',
  tools: {
    search: webSearchTool,
  },
})
