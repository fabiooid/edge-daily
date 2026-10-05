import PageShell from '@/components/page-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <p className="sr-only">Loading...</p>
    </PageShell>
  )
}
