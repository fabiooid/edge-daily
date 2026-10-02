import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { EditionStoryView, EditionView } from '@/lib/queries/editions'
import { formatPostDate, formatWeekLabel, paragraphs } from '@/lib/utils'

function StoryBlock({
  edition,
  story,
  asHeading,
}: {
  edition: EditionView
  story: EditionStoryView
  asHeading: 'h1' | 'h2'
}) {
  const TitleTag = asHeading
  const titleClass =
    asHeading === 'h1'
      ? 'font-heading text-4xl font-bold leading-tight tracking-tight'
      : 'font-heading text-2xl font-bold leading-tight tracking-tight'

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit font-medium">
          {story.isAsia ? 'Asia watch' : 'Story'}
        </Badge>
        <TitleTag className={titleClass}>
          <Link href={`/editions/${edition.editionWeek}/${story.slug}`} className="hover:underline">
            {story.headline}
          </Link>
        </TitleTag>
      </header>

      <div className="flex flex-col gap-6 text-base leading-7">
        {paragraphs(story.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="flex flex-col gap-5">
        <Separator />
        <h3 className="font-heading text-lg font-semibold">Why it matters</h3>
        <p className="text-base leading-7">{story.whyItMatters}</p>
      </section>

      {story.asiaAngle && (
        <section className="flex flex-col gap-5">
          <h3 className="font-heading text-lg font-semibold">Asia angle</h3>
          <p className="text-base leading-7">{story.asiaAngle}</p>
        </section>
      )}

      {story.citations.length > 0 && (
        <section className="flex flex-col gap-5">
          <Separator />
          <h3 className="font-heading text-lg font-semibold">Further Reading</h3>
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
  )
}

export default function EditionViewBlock({
  edition,
  preview = false,
}: {
  edition: EditionView
  preview?: boolean
}) {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit font-medium">
          {preview ? 'Preview' : formatWeekLabel(edition.editionWeek)}
        </Badge>
        <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
          The AI week in Asia
        </h1>
        <p className="text-sm text-muted-foreground">
          {edition.publishedAt
            ? formatPostDate(edition.publishedAt)
            : `${formatPostDate(edition.windowStart)} to ${formatPostDate(edition.windowEnd)}`}
        </p>
      </header>

      {edition.lede.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="font-heading text-lg font-semibold">This week in 30 seconds</h2>
          <ul className="flex list-disc flex-col gap-3 pl-5 text-base leading-7">
            {edition.lede.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {edition.stories.map((story, index) => (
        <div key={story.id} className="flex flex-col gap-10">
          {index > 0 && <Separator />}
          <StoryBlock edition={edition} story={story} asHeading="h2" />
        </div>
      ))}
    </div>
  )
}
