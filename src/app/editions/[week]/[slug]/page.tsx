import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Breadcrumbs from '@/components/breadcrumbs'
import FurtherReading from '@/components/further-reading'
import PageShell from '@/components/page-shell'
import { getEditionByWeek } from '@/lib/queries/editions'
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
  const story = edition?.stories.find((item) => item.slug === slug)
  if (!edition || !story) notFound()

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: formatWeekLabel(week), to: `/editions/${week}` },
          { label: story.headline },
        ]}
      />
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit font-medium">
            {story.isAsia ? 'Asia watch' : 'Story'}
          </Badge>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            {story.headline}
          </h1>
        </header>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {paragraphs(story.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Why it matters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-base leading-7">
            <p>{story.whyItMatters}</p>
            {story.asiaAngle && (
              <p>
                <span className="font-medium">Asia angle. </span>
                {story.asiaAngle}
              </p>
            )}
          </CardContent>
        </Card>
        <FurtherReading links={story.citations} />
      </article>
    </PageShell>
  )
}
