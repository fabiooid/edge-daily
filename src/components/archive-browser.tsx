'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import CoverArt from '@/components/cover-art'
import StatusAlert from '@/components/status-alert'
import { formatLongDate, formatWeekDisplay } from '@/lib/story-meta'

export type ArchiveEditionItem = {
  href: string
  week: string
  date: string | null
  excerpt: string
  seed: string
}

export default function ArchiveBrowser({ editions }: { editions: ArchiveEditionItem[] }) {
  const [query, setQuery] = useState('')

  const filteredEditions = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return editions
    return editions.filter((edition) =>
      `${edition.week} ${formatWeekDisplay(edition.week)} ${edition.excerpt}`.toLowerCase().includes(needle),
    )
  }, [editions, query])

  return (
    <div>
      {editions.length > 0 && (
        <Input
          type="search"
          placeholder="Search editions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="md:max-w-sm"
        />
      )}

      <section className={editions.length > 0 ? 'mt-12' : 'mt-2'}>
        {filteredEditions.length === 0 ? (
          <StatusAlert
            title={editions.length === 0 ? 'No weekly editions are live yet.' : 'No weekly editions match.'}
            description={
              editions.length === 0
                ? 'The first Meridian issue publishes after it is approved. Check back on a Tuesday morning Hong Kong time.'
                : 'Try another search, or check back after the next Tuesday.'
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredEditions.map((edition) => (
              <Link key={edition.href} href={edition.href} className="group block">
                <article className="overflow-hidden rounded-xl ring-1 ring-foreground/10 transition duration-200 group-hover:-translate-y-1 group-hover:ring-foreground/25">
                  <CoverArt
                    seed={edition.seed}
                    theme="AI"
                    region="Global"
                    className="aspect-[16/8]"
                  />
                  <div className="p-5">
                    <Badge variant="secondary">{formatWeekDisplay(edition.week)}</Badge>
                    <h3 className="mt-3 font-heading text-2xl font-bold tracking-tight group-hover:underline">
                      The AI week, wherever it lands
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{edition.excerpt}</p>
                    <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">
                      {edition.date ? formatLongDate(edition.date) : formatWeekDisplay(edition.week)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
