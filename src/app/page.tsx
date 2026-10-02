import type { Metadata } from 'next'
import EditionViewBlock from '@/components/edition-view'
import EmptyState from '@/components/empty-state'
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
      <main className="mx-auto max-w-[720px] px-8 py-16">
        <EmptyState
          title="The site could not load this edition"
          body="The database is not reachable right now. This is an error, not an empty archive. Try again in a few minutes."
        />
      </main>
    )
  }

  if (!edition) {
    return (
      <main className="mx-auto max-w-[720px] px-8 py-16">
        <EmptyState
          title="No weekly edition is live yet"
          body="The first Edge Weekly issue publishes after it is approved. Check back on a Tuesday morning Hong Kong time."
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <EditionViewBlock edition={edition} />
    </main>
  )
}
