import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ArchiveV1List from '@/components/archive-v1-list'
import Breadcrumbs from '@/components/breadcrumbs'
import PageShell from '@/components/page-shell'
import PostsEmpty from '@/components/posts-empty'
import { getArchivePosts, getPublishedEditions } from '@/lib/queries/editions'
import { formatPostDate, formatWeekLabel, getPostExcerpt } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Weekly editions and the earlier Edge Daily archive.',
}

export default async function ArchivePage() {
  try {
    const [editions, posts] = await Promise.all([getPublishedEditions(), getArchivePosts()])

    return (
      <PageShell>
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Archive' },
          ]}
        />

        <h1 className="mb-10 font-heading text-4xl font-bold tracking-tight">
          Archive
        </h1>

        <section className="mb-16">
          <h2 className="mb-10 font-heading text-lg font-semibold">Weekly editions</h2>
          {editions.length === 0 ? (
            <PostsEmpty
              title="No weekly editions yet."
              description="Approved Tuesday editions will show up here."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {editions.map((edition) => (
                <Link key={edition.id} href={`/editions/${edition.editionWeek}`} className="block">
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">
                        {formatWeekLabel(edition.editionWeek)}
                      </Badge>
                      <CardTitle className="text-xl font-semibold leading-snug">
                        The AI week in Asia
                      </CardTitle>
                      <CardDescription className="flex flex-col gap-3 text-sm">
                        <span>
                          {edition.publishedAt
                            ? formatPostDate(edition.publishedAt)
                            : edition.editionWeek}
                        </span>
                        {edition.lede[0] && (
                          <span className="text-foreground/80">
                            {getPostExcerpt(edition.lede.join(' '))}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold">Archive (v1)</h2>
          <p className="mb-10 text-sm leading-7 text-muted-foreground">
            These posts are from the earlier Edge Daily site. That version covered AI, Web3,
            Fintech and Energy. They are kept here so old links still work.
          </p>
          {posts.length === 0 ? (
            <PostsEmpty
              title="Archive is empty."
              description="The v1 import has not been run yet."
            />
          ) : (
            <ArchiveV1List
              posts={posts.map((post) => ({
                id: post.id,
                slug: post.legacySlug,
                theme: post.theme,
                title: post.title,
                content: post.content,
                date: String(post.date),
              }))}
            />
          )}
        </section>
      </PageShell>
    )
  } catch {
    return (
      <PageShell>
        <PostsEmpty
          title="The archive could not be loaded"
          description="The database is not reachable right now. This is an error, not an empty list."
        />
      </PageShell>
    )
  }
}
