'use client'

import PageShell from '@/components/page-shell'
import StatusAlert from '@/components/status-alert'

export default function ErrorPage() {
  return (
    <PageShell>
      <StatusAlert
        tone="error"
        title="Something went wrong"
        description="The page failed to load. This is an error, not an empty archive. Please try again in a few minutes."
      />
    </PageShell>
  )
}
