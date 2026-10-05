import type { Metadata } from 'next'
import ArchiveBrowser from '@/components/archive-browser'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import SignupBand from '@/components/signup-band'
import StatusAlert from '@/components/status-alert'
import { getPublishedEditions } from '@/lib/queries/editions'
import { getPostExcerpt } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Past Meridian weekly editions.',
}

export default async function ArchivePage() {
  try {
    const editions = await getPublishedEditions()

    return (
      <>
        <PageShell>
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Archive' },
            ]}
          />
          <header className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl">Archive</h1>
            <p className="mt-4 text-lg leading-7 text-muted-foreground">
              Every Tuesday edition of Meridian. Search by week or story.
            </p>
          </header>
          <div className="mt-10">
            <ArchiveBrowser
              editions={editions.map((edition) => ({
                href: `/editions/${edition.editionWeek}`,
                week: edition.editionWeek,
                date: edition.publishedAt ? edition.publishedAt.toISOString() : null,
                excerpt: getPostExcerpt(edition.lede.join(' '), 180),
                seed: edition.editionWeek,
              }))}
            />
          </div>
        </PageShell>
        <SignupBand />
      </>
    )
  } catch {
    return (
      <PageShell>
        <StatusAlert
          tone="error"
          title="The archive could not be loaded"
          description="The database is not reachable right now. This is an error, not an empty list."
        />
      </PageShell>
    )
  }
}
