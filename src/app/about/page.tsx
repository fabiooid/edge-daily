import type { Metadata } from 'next'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import SignupBand from '@/components/signup-band'

export const metadata: Metadata = {
  title: 'About',
  description: 'How Edge Weekly is made.',
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
            Edge Weekly
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight md:text-6xl">
            About
          </h1>
          <div className="prose prose-article prose-neutral dark:prose-invert mt-8 max-w-none">
            <p>
              Edge Weekly is the AI week in Asia. It is a short Tuesday briefing for
              anyone in Asia who follows AI and wants the week explained plainly.
            </p>
            <p>
              Stories come from a curated set of feeds and APIs. Code, not a prompt,
              drops anything older than seven days. A person approves the edition
              before the page goes live, unless auto-publish is on and the eval bar
              is met.
            </p>
            <p>
              The earlier Edge Daily posts live under Archive (v1). That version
              also covered Web3, Fintech and Energy.
            </p>
          </div>
        </article>
      </PageShell>
      <SignupBand />
    </>
  )
}
