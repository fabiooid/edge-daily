import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EditionViewBlock from '@/components/edition-view'
import { getEditionByWeek } from '@/lib/queries/editions'
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
    title: `${site.subtitle}, ${edition.editionWeek}`,
    description: edition.lede.join(' '),
    openGraph: {
      title: `Edge Weekly ${edition.editionWeek}`,
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
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <EditionViewBlock edition={edition} />
    </main>
  )
}
