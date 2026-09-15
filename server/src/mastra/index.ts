import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { topicAgent } from './agents/topic-agent.ts'
import { writerAgent } from './agents/writer-agent.ts'
import { relevanceAgent } from './agents/relevance-agent.ts'
import { evalAgent } from './agents/eval-agent.ts'
import { tweetAgent } from './agents/tweet-agent.ts'
import { generateDailyPostWorkflow } from './workflows/generate-daily-post.ts'
import {
  listRecentTitlesTool,
  resolveThemeTool,
  savePostTool,
} from './tools/post-tools.ts'

export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'edge-daily-mastra',
    url: 'file:./mastra.db',
  }),
  agents: {
    topicAgent,
    writerAgent,
    relevanceAgent,
    evalAgent,
    tweetAgent,
  },
  workflows: {
    generateDailyPostWorkflow,
  },
  tools: {
    resolveThemeTool,
    listRecentTitlesTool,
    savePostTool,
  },
})
