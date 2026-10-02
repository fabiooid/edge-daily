import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import EmptyState from '@/components/empty-state'
import { getArchivePosts, getPublishedEditions } from '@/lib/queries/editions'
import { formatDate, formatWeekLabel } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Weekly editions and the earlier Edge Daily archive.',
}

export default async function ArchivePage() {
  try {
    const [editions, posts] = await Promise.all([getPublishedEditions(), getArchivePosts()])

    return (
      <main className="mx-auto max-w-[720px] px-8 py-16">
        <h1 className="mb-10 font-heading text-4xl font-bold tracking-tight">Archive</h1>

        <section className="mb-16">
          <h2 className="mb-6 font-heading text-xl font-semibold">Weekly editions</h2>
          {editions.length === 0 ? (
            <EmptyState
              title="No weekly editions yet"
              body="Approved Tuesday editions will show up here."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {editions.map((edition) => (
                <Link key={edition.id} href={`/editions/${edition.editionWeek}`}>
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">
                        {formatWeekLabel(edition.editionWeek)}
                      </Badge>
                      <CardTitle>The AI week in Asia</CardTitle>
                      <CardDescription>
                        {edition.publishedAt ? formatDate(edition.publishedAt) : edition.editionWeek}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl font-semibold">Archive (v1)</h2>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            These posts are from the earlier Edge Daily site. That version covered AI, Web3,
            Fintech and Energy. They are kept here so old links still work.
          </p>
          {posts.length === 0 ? (
            <EmptyState title="Archive is empty" body="The v1 import has not been run yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/archive/v1/${post.legacySlug}`}>
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">
                        {post.theme}
                      </Badge>
                      <CardTitle className="text-xl leading-snug">{post.title}</CardTitle>
                      <CardDescription>{formatDate(post.date)}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    )
  } catch {
    return (
      <main className="mx-auto max-w-[720px] px-8 py-16">
        <EmptyState
          title="The archive could not be loaded"
          body="The database is not reachable right now. This is an error, not an empty list."
        />
      </main>
    )
  }
}
