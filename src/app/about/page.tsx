import type { Metadata } from 'next'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import SignupBand from '@/components/signup-band'
import { site } from '../../../config/site'

export const metadata: Metadata = {
  title: 'About',
  description: 'A weekly AI roundup: the AI week, wherever it lands.',
}

export default function AboutPage() {
  return (
    <>
      <PageShell>
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'About' },
          ]}
        />
        <article className="max-w-[68ch]">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {site.name}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight md:text-6xl">
            The AI week, wherever it lands
          </h1>
          <div className="prose prose-article prose-neutral dark:prose-invert mt-8 max-w-none">
            <p>
              Meridian is a Tuesday briefing of the AI stories that actually moved
              the week. Global news. Each one tagged by place. Written with a take
              on why it matters, not a restatement of the headline.
            </p>
            <p>
              It is for people who follow AI closely enough to care, and who do not
              want a dump of launches. If you brief a team, write a note, or just
              want the week in ten minutes, this is for you.
            </p>
            <h2>What we cover</h2>
            <p>
              Models, labs, policy, and the markets around them, wherever they land.
              A Hong Kong sandbox, a Brussels rule, a Bangalore hospital trial, a
              US lab release: if it changes what you can use, buy, or plan for,
              it is in scope. If it is only noise, it is out.
            </p>
            <h2>How we pick</h2>
            <p>
              Meridian is curated. We read a short, hand-picked list of sources we
              trust, then choose five to seven stories. You get an editorial read,
              not a scrape of every feed on the internet.
            </p>
            <h2>A typical Tuesday</h2>
            <p>
              A lead story, a handful more, and a short &ldquo;why it matters here&rdquo; on
              each one. Ten minutes, once a week, Tuesday morning Hong Kong time.
              Meridian starts at Week 1.
            </p>
          </div>
        </article>
      </PageShell>
      <SignupBand />
    </>
  )
}
