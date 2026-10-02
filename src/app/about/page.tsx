import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'How Edge Weekly is made.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <h1 className="mb-6 font-heading text-4xl font-bold">About</h1>
      <div className="flex flex-col gap-5 text-base leading-7">
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
    </main>
  )
}
