import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import EditionViewBlock from '@/components/edition-view'
import PageShell from '@/components/page-shell'
import { getEditionByPreviewToken } from '@/lib/queries/editions'

export const metadata: Metadata = {
  title: 'Private preview',
  robots: { index: false, follow: false },
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const edition = await getEditionByPreviewToken(token).catch(() => null)
  if (!edition) notFound()

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Preview' },
        ]}
      />
      <p className="mb-10 text-sm text-muted-foreground">
        Private preview. Approval happens in Telegram, not on this page.
      </p>
      <EditionViewBlock edition={edition} preview />
    </PageShell>
  )
}
