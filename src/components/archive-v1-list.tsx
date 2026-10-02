'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import PostsEmpty from '@/components/posts-empty'
import {
  formatPostDate,
  getPostExcerpt,
  themeLabel,
  V1_THEMES,
} from '@/lib/utils'

const POSTS_PER_PAGE = 5

export type ArchivePostItem = {
  id: string
  slug: string
  theme: string
  title: string
  content: string
  date: string
}

type ThemeFilter = 'All' | (typeof V1_THEMES)[number]

export default function ArchiveV1List({ posts }: { posts: ArchivePostItem[] }) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>('All')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPosts = useMemo(
    () =>
      selectedTheme === 'All'
        ? posts
        : posts.filter((post) => post.theme === selectedTheme),
    [posts, selectedTheme],
  )

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const page = Math.min(currentPage, totalPages)
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  )

  return (
    <div>
      <ToggleGroup
        value={[selectedTheme]}
        onValueChange={(value) => {
          if (!value[0]) return
          setSelectedTheme(value[0] as ThemeFilter)
          setCurrentPage(1)
        }}
        variant="outline"
        spacing={2}
        className="mb-10 flex-wrap"
      >
        <ToggleGroupItem value="All">All</ToggleGroupItem>
        {V1_THEMES.map((theme) => (
          <ToggleGroupItem key={theme} value={theme}>
            {themeLabel(theme)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {paginatedPosts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {paginatedPosts.map((post) => (
            <Link key={post.id} href={`/archive/v1/${post.slug}`} className="block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {themeLabel(post.theme)}
                  </Badge>
                  <CardTitle className="text-xl font-semibold leading-snug">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-3 text-sm">
                    <span>{formatPostDate(post.date)}</span>
                    <span className="text-foreground/80">
                      {getPostExcerpt(post.content)}
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <PostsEmpty
          title="No posts in this filter."
          description="Try another theme, or check back after the next import."
        />
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
    </div>
  )
}
