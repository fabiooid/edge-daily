import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
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
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <p className="mb-8 text-sm">
        <Link href={`/editions/${week}`} className="text-muted-foreground hover:text-foreground">
          Back to the edition
        </Link>
      </p>
      <article className="flex flex-col gap-6">
        {story.isAsia && <Badge variant="outline" className="w-fit">Asia watch</Badge>}
        <h1 className="font-heading text-4xl font-bold leading-tight">{story.headline}</h1>
        {paragraphs(story.body).map((paragraph) => (
          <p key={paragraph} className="text-base leading-7">
            {paragraph}
          </p>
        ))}
        <div className="rounded-lg bg-muted/60 px-4 py-3">
          <p className="text-sm font-medium">Why it matters</p>
          <p className="mt-1 text-sm leading-6">{story.whyItMatters}</p>
        </div>
        {story.asiaAngle && (
          <div>
            <p className="text-sm font-medium">Asia angle</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{story.asiaAngle}</p>
          </div>
        )}
        <ul className="flex flex-col gap-2 text-sm">
          {story.citations.map((citation) => (
            <li key={citation.url}>
              <a href={citation.url} className="border-b border-foreground/20 pb-px hover:border-foreground">
                {citation.title}
              </a>
            </li>
          ))}
        </ul>
      </article>
    </main>
  )
}
