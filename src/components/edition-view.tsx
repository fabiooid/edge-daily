import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { EditionView } from '@/lib/queries/editions'
import { formatDate, formatWeekLabel, paragraphs } from '@/lib/utils'

export default function EditionViewBlock({
  edition,
  preview = false,
}: {
  edition: EditionView
  preview?: boolean
}) {
  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          {preview ? 'Preview' : formatWeekLabel(edition.editionWeek)}
        </Badge>
        <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
          The AI week in Asia
        </h1>
        <p className="text-sm text-muted-foreground">
          {edition.publishedAt
            ? formatDate(edition.publishedAt)
            : `Window ${formatDate(edition.windowStart)} to ${formatDate(edition.windowEnd)}`}
        </p>
      </header>

      {edition.lede.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">This week in 30 seconds</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-7">
            {edition.lede.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-14">
        {edition.stories.map((story) => (
          <section key={story.id} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {story.isAsia && (
                <Badge variant="outline" className="w-fit">
                  Asia watch
                </Badge>
              )}
              <h2 className="font-heading text-2xl font-semibold leading-snug">
                <Link href={`/editions/${edition.editionWeek}/${story.slug}`} className="hover:underline">
                  {story.headline}
                </Link>
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-base leading-7">
              {paragraphs(story.body).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
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
            {story.citations.length > 0 && (
              <ul className="flex flex-col gap-2 text-sm">
                {story.citations.map((citation) => (
                  <li key={citation.url}>
                    <a
                      href={citation.url}
                      className="border-b border-foreground/20 pb-px hover:border-foreground"
                    >
                      {citation.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <Separator />
          </section>
        ))}
      </div>
    </article>
  )
}
