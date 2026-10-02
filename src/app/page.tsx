import type { Metadata } from 'next'
import EditionViewBlock from '@/components/edition-view'
import PageShell from '@/components/page-shell'
import PostsEmpty from '@/components/posts-empty'
import { getLatestPublishedEdition } from '@/lib/queries/editions'
import { site } from '../../config/site'

export const metadata: Metadata = {
  title: `${site.name}: ${site.subtitle}`,
  description: site.description,
}

export default async function HomePage() {
  let edition
  try {
    edition = await getLatestPublishedEdition()
  } catch {
    return (
      <PageShell>
        <PostsEmpty
          title="The site could not load this edition"
          description="The database is not reachable right now. This is an error, not an empty archive. Try again in a few minutes."
        />
      </PageShell>
    )
  }

  if (!edition) {
    return (
      <PageShell>
        <PostsEmpty />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <EditionViewBlock edition={edition} />
    </PageShell>
  )
}
