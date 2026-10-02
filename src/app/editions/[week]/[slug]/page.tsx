import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import { getEditionByWeek } from '@/lib/queries/editions'
import { paragraphs } from '@/lib/utils'

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
  const story = edition?.stories.find((item) => item.slug === slug)
  if (!edition || !story) notFound()

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: formatWeekLabelSafe(week), to: `/editions/${week}` },
          { label: story.headline },
        ]}
      />
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit font-medium">
            {story.isAsia ? 'Asia watch' : 'Story'}
          </Badge>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
            {story.headline}
          </h1>
        </header>

        <div className="flex flex-col gap-6 text-base leading-7">
          {paragraphs(story.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="flex flex-col gap-5">
          <Separator />
          <h2 className="font-heading text-lg font-semibold">Why it matters</h2>
          <p className="text-base leading-7">{story.whyItMatters}</p>
        </section>

        {story.asiaAngle && (
          <section className="flex flex-col gap-5">
            <h2 className="font-heading text-lg font-semibold">Asia angle</h2>
            <p className="text-base leading-7">{story.asiaAngle}</p>
          </section>
        )}

        {story.citations.length > 0 && (
          <section className="flex flex-col gap-5">
            <Separator />
            <h2 className="font-heading text-lg font-semibold">Further Reading</h2>
            <ul className="flex flex-col gap-3">
              {story.citations.map((citation) => (
                <li key={citation.url}>
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-foreground/20 pb-px text-[0.9375rem] transition-colors hover:border-foreground"
                  >
                    {citation.title}
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

function formatWeekLabelSafe(week: string): string {
  return week.replace('-W', ' week ')
}
