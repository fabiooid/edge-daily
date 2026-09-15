import { Agent } from '@mastra/core/agent'
import { webSearchTool } from '@mastra/core/tools'

export const writerAgent = new Agent({
  id: 'writer-agent',
  name: 'Writer Agent',
  instructions: `You are a professional tech journalist writing for Edge Daily.
Write clear, specific news articles with real source links from web search.
Never use em dashes. Never invent URLs. Prefer exactly 3 highly relevant links.`,
  model: 'anthropic/claude-sonnet-4-6',
  tools: {
    search: webSearchTool,
  },
})
