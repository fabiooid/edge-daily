import PageShell from '@/components/page-shell'
import StatusAlert from '@/components/status-alert'

export default function NotFound() {
  return (
    <PageShell>
      <StatusAlert
        tone="error"
        title="This page is missing"
        description="The edition or story you asked for is not published, or the link is wrong."
      />
    </PageShell>
  )
}
