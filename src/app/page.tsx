import type { Metadata } from 'next'
import HomeMagazine from '@/components/home-magazine'
import PageShell from '@/components/page-shell'
import StatusAlert from '@/components/status-alert'
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
        <StatusAlert
          tone="error"
          title="The site could not load this edition"
          description="The database is not reachable right now. This is an error, not an empty archive. Try again in a few minutes."
        />
      </PageShell>
    )
  }

  if (!edition) {
    return (
      <PageShell>
        <StatusAlert
          title="No weekly edition is live yet."
          description="The first Edge Weekly issue publishes after it is approved. Check back on a Tuesday morning Hong Kong time."
        />
      </PageShell>
    )
  }

  return <HomeMagazine edition={edition} />
}
