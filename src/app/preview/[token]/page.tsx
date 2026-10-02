import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EditionViewBlock from '@/components/edition-view'
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
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <p className="mb-8 rounded-lg bg-muted px-4 py-3 text-sm">
        Private preview. Approval happens in Telegram, not on this page.
      </p>
      <EditionViewBlock edition={edition} preview />
    </main>
  )
}
