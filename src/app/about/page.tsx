import type { Metadata } from 'next'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'About',
  description: 'How Edge Weekly is made.',
}

export default function AboutPage() {
  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'About' },
        ]}
      />
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
            About
          </h1>
        </header>
        <div className="flex flex-col gap-6 text-base leading-7">
          <p>
            Edge Weekly is the AI week in Asia. It is a short Tuesday briefing for
            anyone in Asia who follows AI and wants the week explained plainly.
          </p>
          <p>
            Stories come from a curated set of feeds and APIs. Code, not a prompt,
            drops anything older than seven days. A person approves the edition
            before the page goes live.
          </p>
          <p>
            The earlier Edge Daily posts live under Archive (v1). That version
            also covered Web3, Fintech and Energy.
          </p>
        </div>
      </article>
    </PageShell>
  )
}
