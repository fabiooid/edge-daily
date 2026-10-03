import BriefPanel from '@/components/brief-panel'
import PageShell from '@/components/page-shell'
import SignupBand from '@/components/signup-band'
import StoryCard from '@/components/story-card'
import { formatLongDate, formatWeekDisplay } from '@/lib/story-meta'
import { toStoryCard } from '@/lib/story-view'
import type { EditionView } from '@/lib/queries/editions'

export default function HomeMagazine({ edition }: { edition: EditionView }) {
  const [lead, ...rest] = edition.stories
  if (!lead) return null

  return (
    <>
      <PageShell>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Edge Weekly · {formatWeekDisplay(edition.editionWeek)}
          {edition.publishedAt ? ` · ${formatLongDate(edition.publishedAt)}` : ''}
        </p>
        <h1 className="sr-only">The AI week in Asia</h1>
        <div className="mt-6">
          <StoryCard story={toStoryCard(edition, lead)} featured />
        </div>
        {rest.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold tracking-tight">Also this week</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((story) => (
                <StoryCard key={story.id} story={toStoryCard(edition, story)} />
              ))}
            </div>
          </section>
        )}
        <div className="mt-14">
          <BriefPanel lines={edition.lede} />
        </div>
      </PageShell>
      <SignupBand />
    </>
  )
}
