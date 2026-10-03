import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import FurtherReading from '@/components/further-reading'
import type { EditionStoryView, EditionView } from '@/lib/queries/editions'
import { formatPostDate, formatWeekLabel, paragraphs } from '@/lib/utils'

function EditionHero({ edition, preview }: { edition: EditionView; preview: boolean }) {
  return (
    <header className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit font-medium">
        {preview ? 'Preview' : formatWeekLabel(edition.editionWeek)}
      </Badge>
      <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
        The AI week in Asia
      </h1>
      <p className="text-sm text-muted-foreground">
        {edition.publishedAt
          ? formatPostDate(edition.publishedAt)
          : `${formatPostDate(edition.windowStart)} to ${formatPostDate(edition.windowEnd)}`}
      </p>
    </header>
  )
}

function LedeCard({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">This week in 30 seconds</CardTitle>
        <CardDescription>The brief, before the full stories.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-base leading-7">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function NumberedStoryList({ edition }: { edition: EditionView }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h2 className="font-heading text-lg font-semibold">Stories</h2>
        <Separator className="flex-1" />
      </div>
      <ol className="flex flex-col gap-3">
        {edition.stories.map((story, index) => (
          <li key={story.id}>
            <Link href={`/editions/${edition.editionWeek}/${story.slug}`} className="block">
              <Card className="transition-colors hover:bg-muted">
                <CardHeader className="grid-cols-[auto_1fr] items-start gap-4">
                  <span className="font-heading text-2xl font-semibold text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-2">
                    {story.isAsia && (
                      <Badge variant="secondary" className="w-fit font-medium">
                        Asia watch
                      </Badge>
                    )}
                    <CardTitle className="text-xl font-semibold leading-snug">
                      {story.headline}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      {story.whyItMatters}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

function StoryBlock({
  edition,
  story,
}: {
  edition: EditionView
  story: EditionStoryView
}) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit font-medium">
          {story.isAsia ? 'Asia watch' : 'Story'}
        </Badge>
        <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight">
          <Button
            variant="link"
            className="h-auto px-0 text-left text-2xl font-bold whitespace-normal text-foreground"
            render={<Link href={`/editions/${edition.editionWeek}/${story.slug}`} />}
            nativeButton={false}
          >
            {story.headline}
          </Button>
        </h2>
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
    <div className="flex flex-col gap-12">
      <EditionHero edition={edition} preview={preview} />
      <LedeCard lines={edition.lede} />
      <NumberedStoryList edition={edition} />
      {edition.stories.map((story, index) => (
        <div key={story.id} className="flex flex-col gap-12">
          {index === 0 && (
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-lg font-semibold">The briefing</h2>
              <Separator className="flex-1" />
            </div>
          )}
          {index > 0 && <Separator />}
          <StoryBlock edition={edition} story={story} />
        </div>
      ))}
    </div>
  )
}
