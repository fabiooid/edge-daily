import { Spinner } from '@/components/ui/spinner'
import PageShell from './PageShell'

export default function Loading() {
  return (
    <PageShell className="flex min-h-100 flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-muted-foreground">Loading...</p>
    </PageShell>
  )
}
