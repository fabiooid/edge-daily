import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { getArchivePost } from '@/lib/queries/editions'
import { formatDate, paragraphs } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getArchivePost(slug).catch(() => null)
  if (!post) return { title: 'Archive post not found' }
  return {
    title: post.title,
    description: post.content.slice(0, 160),
  }
}

export default async function ArchivePostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getArchivePost(slug).catch(() => null)
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <p className="mb-8 text-sm">
        <Link href="/archive" className="text-muted-foreground hover:text-foreground">
          Back to archive
        </Link>
      </p>
      <article className="flex flex-col gap-6">
        <Badge variant="secondary" className="w-fit">
          {post.theme} · v1
        </Badge>
        <h1 className="font-heading text-4xl font-bold leading-tight">{post.title}</h1>
        <p className="text-sm text-muted-foreground">{formatDate(post.date)}</p>
        {paragraphs(post.content).map((paragraph) => (
          <p key={paragraph} className="text-base leading-7">
            {paragraph}
          </p>
        ))}
        {post.links.length > 0 && (
          <ul className="flex flex-col gap-2 text-sm">
            {post.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} className="border-b border-foreground/20 pb-px hover:border-foreground">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </article>
    </main>
  )
}
