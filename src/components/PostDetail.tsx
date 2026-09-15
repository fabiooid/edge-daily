import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPostBySlug } from '@/lib/api'
import type { Post } from '@/lib/posts'
import Breadcrumbs from './Breadcrumbs'
import Loading from './Loading'
import PageShell from './PageShell'
import PostBody from './PostBody'
import PostsEmpty from './PostsEmpty'

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setPost(null)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchPostBySlug(slug)
      .then(setPost)
      .catch((err: unknown) => {
        console.error('Error fetching post:', err)
        setPost(null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loading />

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Archive', to: '/archive' },
          { label: post?.title || 'Post' },
        ]}
      />
      {post ? (
        <PostBody post={post} />
      ) : (
        <PostsEmpty
          title="Post not found"
          description="This post may have been removed or the link is incorrect."
        />
      )}
    </PageShell>
  )
}
