import { useEffect, useState } from 'react'
import { fetchLatestPost } from '@/lib/api'
import type { Post } from '@/lib/posts'
import Loading from './Loading'
import PageShell from './PageShell'
import PostBody from './PostBody'
import PostsEmpty from './PostsEmpty'

export default function DailyPost() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestPost()
      .then(setPost)
      .catch((err: unknown) => {
        console.error('Error fetching post:', err)
        setPost(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <PageShell>
      {post ? <PostBody post={post} /> : <PostsEmpty />}
    </PageShell>
  )
}
