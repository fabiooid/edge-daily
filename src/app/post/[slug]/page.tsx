import { redirect } from 'next/navigation'

export default async function LegacyPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/archive/v1/${slug}`)
}
