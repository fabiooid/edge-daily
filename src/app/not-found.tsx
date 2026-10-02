import EmptyState from '@/components/empty-state'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[720px] px-8 py-16">
      <EmptyState
        title="This page is missing"
        body="The edition or story you asked for is not published, or the link is wrong."
      />
    </main>
  )
}
