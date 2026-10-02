'use client'

import EmptyState from '@/components/empty-state'

export default function ErrorPage() {
  return (
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <EmptyState
        title="Something went wrong"
        body="The page failed to load. This is an error, not an empty archive. Please try again in a few minutes."
      />
    </main>
  )
}
