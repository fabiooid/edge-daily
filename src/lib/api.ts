import type { Post } from '@/lib/posts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function fetchLatestPost(): Promise<Post> {
  return fetchJson<Post>('/api/posts/latest')
}

export function fetchPosts(): Promise<Post[]> {
  return fetchJson<Post[]>('/api/posts')
}

export function fetchPostBySlug(slug: string): Promise<Post> {
  return fetchJson<Post>(`/api/posts/${slug}`)
}
