import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import EditionViewBlock from '@/components/edition-view'
import PageShell from '@/components/page-shell'
import { getEditionByWeek } from '@/lib/queries/editions'
import { formatWeekDisplay } from '@/lib/story-meta'
import { site } from '../../../../config/site'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ week: string }>
}): Promise<Metadata> {
  const { week } = await params
  const edition = await getEditionByWeek(week).catch(() => null)
  if (!edition) return { title: 'Edition not found' }
  return {
    title: `${site.name} ${formatWeekDisplay(edition.editionWeek)}`,
    description: edition.lede.join(' '),
    openGraph: {
      title: `${site.name} ${formatWeekDisplay(edition.editionWeek)}`,
      description: edition.lede[0] || site.description,
    },
  }
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ week: string }>
}) {
  const { week } = await params
  const edition = await getEditionByWeek(week).catch(() => null)
  if (!edition) notFound()

  return (
    <>
      <PageShell className="pb-0">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Archive', to: '/archive' },
            { label: formatWeekDisplay(edition.editionWeek) },
          ]}
        />
      </PageShell>
      <EditionViewBlock edition={edition} />
    </>
  )
}
