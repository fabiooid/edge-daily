import { Agent } from '@mastra/core/agent'

export const tweetAgent = new Agent({
  id: 'tweet-agent',
  name: 'Tweet Agent',
  instructions: `You write punchy tweets for Edge Daily articles.
Rules:
- One sentence
- Direct and specific — mention the key fact or development
- Max about 200 characters
- No hashtags unless they naturally fit
- No filler like "Exciting news" or "Check this out"
- Do not include any URL
- Respond with ONLY the tweet text`,
  model: 'anthropic/claude-haiku-4-5-20251001',
})
