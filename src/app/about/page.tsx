import type { Metadata } from 'next'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import SignupBand from '@/components/signup-band'
import { site } from '../../../config/site'

export const metadata: Metadata = {
  title: 'About',
  description: `How ${site.name} is made.`,
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
            About
          </h1>
          <div className="prose prose-article prose-neutral dark:prose-invert mt-8 max-w-none">
            <p>
              Meridian is the AI week, wherever it lands. It is a short Tuesday briefing of
              the week&apos;s biggest AI stories, explained plainly, with a local read for
              the place each story lands.
            </p>
            <p>
              Stories come from a curated set of feeds and APIs. Code, not a prompt,
              drops anything older than seven days. A person approves the edition
              before the page goes live, unless auto-publish is on and the eval bar
              is met.
            </p>
            <p>
              Meridian starts at Week 1. Earlier Edge Daily posts were not carried
              over.
            </p>
          </div>
        </article>
      </PageShell>
      <SignupBand />
    </>
  )
}
