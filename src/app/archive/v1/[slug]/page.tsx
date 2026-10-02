import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import { getArchivePost } from '@/lib/queries/editions'
import { formatPostDate, paragraphs, themeLabel } from '@/lib/utils'

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
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Archive', to: '/archive' },
          { label: post.title },
        ]}
      />
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit font-medium">
            {themeLabel(post.theme)}
          </Badge>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground">{formatPostDate(post.date)}</p>
        </header>

        <div className="flex flex-col gap-6 text-base leading-7">
          {paragraphs(post.content).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {post.links.length > 0 && (
          <section className="flex flex-col gap-5">
            <Separator />
            <h2 className="font-heading text-lg font-semibold">Further Reading</h2>
            <ul className="flex flex-col gap-3">
              {post.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-foreground/20 pb-px text-[0.9375rem] transition-colors hover:border-foreground"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </PageShell>
  )
}
