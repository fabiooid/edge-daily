import { Badge } from '@/components/ui/badge'
import { formatLongDate, formatWeekDisplay } from '@/lib/story-meta'
import type { EditionView } from '@/lib/queries/editions'

export default function EditionMasthead({
  edition,
  preview = false,
}: {
  edition: EditionView
  preview?: boolean
}) {
  return (
    <header className="border-b border-border pb-10">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{preview ? 'Preview' : formatWeekDisplay(edition.editionWeek)}</Badge>
        <Badge variant="outline">Asia</Badge>
      </div>
      <p className="mt-6 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Edge Weekly
      </p>
      <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight md:text-6xl md:leading-[1.05]">
        The AI week in Asia
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
        {edition.publishedAt
          ? formatLongDate(edition.publishedAt)
          : `${formatLongDate(edition.windowStart)} to ${formatLongDate(edition.windowEnd)}`}
        . {edition.stories.length} stories. Ten minutes.
      </p>
    </header>
  )
}
