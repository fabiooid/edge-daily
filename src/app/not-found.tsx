import PageShell from '@/components/page-shell'
import PostsEmpty from '@/components/posts-empty'

export default function NotFound() {
  return (
    <PageShell>
      <PostsEmpty
        title="This page is missing"
        description="The edition or story you asked for is not published, or the link is wrong."
      />
    </PageShell>
  )
}
