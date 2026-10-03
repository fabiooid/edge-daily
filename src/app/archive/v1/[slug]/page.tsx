import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Breadcrumbs from '@/components/breadcrumbs'
import CoverArt from '@/components/cover-art'
import PageShell from '@/components/page-shell'
import { getArchivePost } from '@/lib/queries/editions'
import { formatLongDate, inferRegion, inferTheme, readingMinutes } from '@/lib/story-meta'
import { paragraphs } from '@/lib/utils'

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

  const theme = inferTheme(post.theme, post.title, post.content)
  const region = inferRegion(post.title, post.content)
  const minutes = readingMinutes(post.content)
  const standfirst = paragraphs(post.content)[0] || post.content.slice(0, 180)

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Archive', to: '/archive' },
          { label: post.title },
        ]}
      />
      <article>
        <header className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{theme}</Badge>
            <Badge variant="outline">{region}</Badge>
          </div>
          <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-balance md:text-6xl md:leading-[1.05]">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{standfirst}</p>
          <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
            Published on {formatLongDate(post.date)} · {minutes} min read
          </p>
        </header>
        <CoverArt seed={post.legacySlug} theme={theme} region={region} className="mt-8 aspect-[16/7] rounded-2xl" />
        <div className="prose prose-article prose-neutral dark:prose-invert mt-12 max-w-[68ch]">
          {paragraphs(post.content).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {post.links.length > 0 && (
          <section className="mt-10 max-w-[68ch]">
            <h2 className="font-heading text-2xl font-bold tracking-tight">Sources</h2>
            <ul className="mt-4 grid gap-3">
              {post.links.map((link) => (
                <li key={link.url}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base leading-snug">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {link.title}
                        </a>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">Further reading</CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </PageShell>
  )
}
