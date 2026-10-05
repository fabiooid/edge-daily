/**
 * Model IDs live here, not hard-coded in agents.
 * Verified against Anthropic docs on 2 October 2026:
 * - claude-sonnet-5-5 is the current Sonnet 5.5 API id
 * - claude-haiku-4-5 is the convenience alias for claude-haiku-4-5-20251001
 */
export const models = {
  writing: process.env.MODEL_WRITING || 'claude-sonnet-5-5',
  ranking: process.env.MODEL_RANKING || 'claude-sonnet-5-5',
  checks: process.env.MODEL_CHECKS || 'claude-haiku-4-5',
  embeddings: process.env.MODEL_EMBEDDINGS || 'text-embedding-3-small',
} as const
