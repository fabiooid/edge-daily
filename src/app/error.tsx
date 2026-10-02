'use client'

import PageShell from '@/components/page-shell'
import PostsEmpty from '@/components/posts-empty'

export default function ErrorPage() {
  return (
    <PageShell>
      <PostsEmpty
        title="Something went wrong"
        description="The page failed to load. This is an error, not an empty archive. Please try again in a few minutes."
      />
    </PageShell>
  )
}
