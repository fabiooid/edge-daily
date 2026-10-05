import Link from 'next/link'
import CoverArt from '@/components/cover-art'
import EditionMasthead from '@/components/edition-masthead'
import PageShell from '@/components/page-shell'
import SignupBand from '@/components/signup-band'
import { toStoryCard } from '@/lib/story-view'
import type { EditionView } from '@/lib/queries/editions'

export default function EditionViewBlock({
  edition,
  preview = false,
}: {
  edition: EditionView
  preview?: boolean
}) {
  return (
    <>
      <PageShell>
        <EditionMasthead edition={edition} preview={preview} />
        <ol className="mt-10 flex flex-col gap-4">
          {edition.stories.map((story, index) => {
            const card = toStoryCard(edition, story)
            return (
              <li key={story.id}>
                <Link
                  href={card.href}
                  className="group grid gap-4 rounded-xl border border-transparent p-2 transition hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-card sm:grid-cols-[140px_1fr] sm:items-center"
                >
                  <CoverArt
                    seed={card.seed}
                    theme={card.theme}
                    region={card.region}
                    compact
                    className="aspect-[16/10] rounded-lg"
                  />
                  <div className="flex gap-4">
                    <span className="font-heading text-2xl font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        {card.region} · {card.theme} · {card.minutes} min
                      </p>
                      <h2 className="mt-1 font-heading text-xl font-bold tracking-tight group-hover:underline md:text-2xl">
                        {story.headline}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{story.whyItMatters}</p>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </PageShell>
      <SignupBand />
    </>
  )
}
