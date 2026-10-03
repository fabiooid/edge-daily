import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Breadcrumbs from '@/components/breadcrumbs'
import CoverArt from '@/components/cover-art'
import PageShell from '@/components/page-shell'
import { getEditionByWeek } from '@/lib/queries/editions'
import { formatLongDate } from '@/lib/story-meta'
import { storySections, toStoryCard } from '@/lib/story-view'
import { formatWeekLabel, paragraphs } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ week: string; slug: string }>
}): Promise<Metadata> {
  const { week, slug } = await params
  const edition = await getEditionByWeek(week).catch(() => null)
  const story = edition?.stories.find((item) => item.slug === slug)
  if (!story) return { title: 'Story not found' }
  return {
    title: story.headline,
    description: story.whyItMatters,
    openGraph: {
      title: story.headline,
      description: story.whyItMatters,
    },
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ week: string; slug: string }>
}) {
  const { week, slug } = await params
  const edition = await getEditionByWeek(week).catch(() => null)
  const index = edition?.stories.findIndex((item) => item.slug === slug) ?? -1
  const story = index >= 0 ? edition?.stories[index] : undefined
  if (!edition || !story) notFound()

  const card = toStoryCard(edition, story)
  const sections = storySections(story)
  const previous = index > 0 ? edition.stories[index - 1] : undefined
  const next = index < edition.stories.length - 1 ? edition.stories[index + 1] : undefined

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: formatWeekLabel(week), to: `/editions/${week}` },
          { label: story.headline },
        ]}
      />
      <article>
        <header className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{card.theme}</Badge>
            <Badge variant="outline">{card.region}</Badge>
          </div>
          <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-balance md:text-6xl md:leading-[1.05]">
            {story.headline}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{story.whyItMatters}</p>
          <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
            {edition.publishedAt ? formatLongDate(edition.publishedAt) : formatWeekLabel(week)}
            {' · '}
            {card.minutes} min read
          </p>
        </header>
        <CoverArt
          seed={card.seed}
          theme={card.theme}
          region={card.region}
          className="mt-8 aspect-[16/7] rounded-2xl"
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <div id="story" className="prose prose-article prose-neutral dark:prose-invert max-w-[68ch] scroll-mt-24">
              {paragraphs(story.body).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <aside
              id="why-it-matters"
              className="mt-10 max-w-[68ch] scroll-mt-24 rounded-2xl border border-foreground/10 bg-muted px-6 py-6"
            >
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Why it matters for Asia
              </p>
              <p className="mt-3 text-base leading-7">{story.whyItMatters}</p>
              {story.asiaAngle && <p className="mt-3 text-base leading-7">{story.asiaAngle}</p>}
            </aside>
            {story.citations.length > 0 && (
              <section id="sources" className="mt-10 max-w-[68ch] scroll-mt-24">
                <h2 className="font-heading text-2xl font-bold tracking-tight">Sources</h2>
                <ul className="mt-4 grid gap-3">
                  {story.citations.map((citation) => (
                    <li key={citation.url}>
                      <Card className="transition hover:ring-foreground/20">
                        <CardHeader>
                          <CardTitle className="text-base leading-snug">
                            <a href={citation.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {citation.title}
                            </a>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                          {citation.isPrimary ? 'Primary source' : 'Further reading'}
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                In this edition
              </p>
              <ol className="mt-4 flex flex-col gap-3 text-sm leading-6">
                {edition.stories.map((item, storyIndex) => (
                  <li key={item.id}>
                    <Link
                      href={`/editions/${week}/${item.slug}`}
                      className={item.slug === story.slug ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}
                    >
                      {String(storyIndex + 1).padStart(2, '0')} {item.headline}
                    </Link>
                  </li>
                ))}
              </ol>
              <ul className="mt-8 flex flex-col gap-2 border-t border-border pt-4 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-muted-foreground hover:text-foreground">
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
        <nav className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {previous ? (
            <Button
              variant="outline"
              className="h-auto justify-start px-4 py-4 text-left whitespace-normal"
              render={<Link href={`/editions/${week}/${previous.slug}`} />}
              nativeButton={false}
            >
              <span>
                <span className="block text-xs text-muted-foreground">Previous</span>
                {previous.headline}
              </span>
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button
              variant="outline"
              className="h-auto justify-end px-4 py-4 text-right whitespace-normal sm:justify-self-end"
              render={<Link href={`/editions/${week}/${next.slug}`} />}
              nativeButton={false}
            >
              <span>
                <span className="block text-xs text-muted-foreground">Next</span>
                {next.headline}
              </span>
            </Button>
          )}
        </nav>
      </article>
    </PageShell>
  )
}
