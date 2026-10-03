import PageShell from '@/components/page-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-10 w-4/5" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-24 w-full" />
      <p className="sr-only">Loading...</p>
    </PageShell>
  )
}
