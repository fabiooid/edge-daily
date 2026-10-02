import { huggingfaceOrgs } from '../../../../config/huggingface-orgs'
import { parsePublishedDate } from '../window'
import type { IngestedItem, SourceAdapter, SourceRecord } from './types'

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'EdgeWeekly/1.0' },
  })
  if (!response.ok) {
    throw new Error(`Hugging Face request failed: ${response.status}`)
  }
  return response.json()
}

function orgsFor(source: SourceRecord): string[] {
  const fromConfig = source.config.orgs
  if (Array.isArray(fromConfig) && fromConfig.every((value) => typeof value === 'string')) {
    return fromConfig
  }
  return [...huggingfaceOrgs]
}

export const huggingfaceAdapter: SourceAdapter = {
  type: 'huggingface',
  async ingest(source, options) {
    if (options.mock) return []
    const items: IngestedItem[] = []
    for (const org of orgsFor(source)) {
      const url = `https://huggingface.co/api/models?author=${encodeURIComponent(org)}&sort=createdAt&direction=-1&limit=20`
      const payload = (await fetchJson(url)) as Array<{
        id?: string
        modelId?: string
        createdAt?: string
        likes?: number
      }>
      for (const model of payload || []) {
        const id = model.id || model.modelId
        if (!id) continue
        items.push({
          sourceId: source.id,
          url: `https://huggingface.co/${id}`,
          title: `${id} released on Hugging Face`,
          publishedAt: parsePublishedDate(model.createdAt),
          excerpt: `New model from ${org}.`,
        })
      }
    }
    return items
  },
}

export const huggingfacePapersAdapter: SourceAdapter = {
  type: 'huggingface_papers',
  async ingest(source, options) {
    if (options.mock) return []
    const payload = (await fetchJson('https://huggingface.co/api/daily_papers')) as Array<{
      paper?: { id?: string; title?: string; publishedAt?: string; summary?: string }
      title?: string
      publishedAt?: string
    }>
    return (payload || []).map((row) => {
      const paper = row.paper || row
      const id = (paper as { id?: string }).id
      return {
        sourceId: source.id,
        url: id ? `https://huggingface.co/papers/${id}` : '',
        title: (paper as { title?: string }).title || 'Daily paper',
        publishedAt: parsePublishedDate((paper as { publishedAt?: string }).publishedAt),
        excerpt: (paper as { summary?: string }).summary,
      }
    }).filter((item) => item.url)
  },
}

export const huggingfaceTrendingAdapter: SourceAdapter = {
  type: 'huggingface_trending',
  async ingest(source, options) {
    if (options.mock) return []
    const payload = (await fetchJson('https://huggingface.co/api/models?sort=trendingScore&limit=20')) as Array<{
      id?: string
      createdAt?: string
    }>
    return (payload || []).map((model) => ({
      sourceId: source.id,
      url: model.id ? `https://huggingface.co/${model.id}` : '',
      title: model.id || 'Trending model',
      publishedAt: parsePublishedDate(model.createdAt),
    })).filter((item) => item.url)
  },
}
