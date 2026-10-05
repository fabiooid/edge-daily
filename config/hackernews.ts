export const hnQueries = [
  { query: 'DeepSeek', minPoints: 100 },
  { query: 'Qwen', minPoints: 100 },
  { query: 'Kimi', minPoints: 100 },
  { query: 'GLM', minPoints: 100 },
  { query: 'MiniMax', minPoints: 100 },
  { query: 'Hunyuan', minPoints: 100 },
  { query: 'China AI', minPoints: 100 },
  { query: 'Japan AI', minPoints: 100 },
  { query: 'Korea AI', minPoints: 100 },
  { query: 'India AI', minPoints: 100 },
  { query: 'Singapore AI', minPoints: 100 },
  { query: 'LLM', minPoints: 200 },
  { query: 'AI', minPoints: 200 },
] as const

export const hnAlgoliaUrl = 'https://hn.algolia.com/api/v1/search_by_date'
