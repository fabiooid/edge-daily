'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import CoverArt from '@/components/cover-art'
import StatusAlert from '@/components/status-alert'
import StoryCard, { type StoryCardModel } from '@/components/story-card'
import { formatLongDate, formatWeekDisplay, inferRegion, inferTheme, readingMinutes } from '@/lib/story-meta'
import { V1_THEMES } from '@/lib/utils'

const POSTS_PER_PAGE = 6

export type ArchiveEditionItem = {
  href: string
  week: string
  date: string | null
  excerpt: string
  seed: string
}

export type ArchivePostItem = {
  id: string
  slug: string
  theme: string
  title: string
  content: string
  date: string
}

type ThemeFilter = 'All' | (typeof V1_THEMES)[number]

export default function ArchiveBrowser({
  editions,
  posts,
}: {
  editions: ArchiveEditionItem[]
  posts: ArchivePostItem[]
}) {
  const [query, setQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>('All')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredEditions = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return editions
    return editions.filter((edition) =>
      `${edition.week} ${edition.excerpt}`.toLowerCase().includes(needle),
    )
  }, [editions, query])

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return posts.filter((post) => {
      if (selectedTheme !== 'All' && post.theme !== selectedTheme) return false
      if (!needle) return true
      return `${post.title} ${post.content}`.toLowerCase().includes(needle)
    })
  }, [posts, query, selectedTheme])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const page = Math.min(currentPage, totalPages)
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          type="search"
          placeholder="Search editions and posts"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setCurrentPage(1)
          }}
          className="md:max-w-sm"
        />
        <ToggleGroup
          value={[selectedTheme]}
          onValueChange={(value) => {
            if (!value[0]) return
            setSelectedTheme(value[0] as ThemeFilter)
            setCurrentPage(1)
          }}
          variant="outline"
          spacing={2}
          className="flex-wrap"
        >
          <ToggleGroupItem value="All">All</ToggleGroupItem>
          {V1_THEMES.map((theme) => (
            <ToggleGroupItem key={theme} value={theme}>
              {theme}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold tracking-tight">Weekly editions</h2>
        {filteredEditions.length === 0 ? (
          <div className="mt-6">
            <StatusAlert
              title="No weekly editions match."
              description="Try another search, or check back after the next Tuesday."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
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
                      {edition.date ? formatLongDate(edition.date) : edition.week}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold tracking-tight">Archive (v1)</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Posts from the earlier Edge Daily site. That version also covered Web3, Fintech and Energy.
        </p>
        {paginatedPosts.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => {
              const card: StoryCardModel = {
                href: `/archive/v1/${post.slug}`,
                title: post.title,
                standfirst: post.content.slice(0, 140).trimEnd() + (post.content.length > 140 ? '...' : ''),
                date: post.date,
                minutes: readingMinutes(post.content),
                theme: inferTheme(post.theme, post.title, post.content),
                region: inferRegion(post.title, post.content),
                seed: post.slug,
              }
              return <StoryCard key={post.id} story={card} />
            })}
          </div>
        ) : (
          <div className="mt-6">
            <StatusAlert
              title="No posts in this filter."
              description="Try another theme or a shorter search."
            />
          </div>
        )}

        {filteredPosts.length > POSTS_PER_PAGE && (
          <Pagination className="mt-10">
            <PaginationContent className="gap-6">
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setCurrentPage((value) => value - 1)}
                >
                  Previous
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setCurrentPage((value) => value + 1)}
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  )
}
