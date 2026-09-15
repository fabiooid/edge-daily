import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { fetchPosts } from '@/lib/api'
import {
  THEMES,
  formatPostDate,
  getPostExcerpt,
  themeLabel,
  type Post,
  type Theme,
} from '@/lib/posts'
import Breadcrumbs from './Breadcrumbs'
import Loading from './Loading'
import PageShell from './PageShell'
import PostsEmpty from './PostsEmpty'

const POSTS_PER_PAGE = 5

type ThemeFilter = 'All' | Theme

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>('All')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchPosts()
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err: unknown) => {
        console.error('Error fetching posts:', err)
        setPosts([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts =
    selectedTheme === 'All'
      ? posts
      : posts.filter((post) => post.theme === selectedTheme)

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const page = Math.min(currentPage, totalPages)
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  )

  if (loading) return <Loading />

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
        {THEMES.map((theme) => (
          <ToggleGroupItem key={theme} value={theme}>
            {themeLabel(theme)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {paginatedPosts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {paginatedPosts.map((post) => (
            <Link key={post.id} to={`/post/${post.slug}`} className="block">
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
        <PostsEmpty />
      )}

      {filteredPosts.length > POSTS_PER_PAGE && (
        <Pagination className="mt-10">
          <PaginationContent className="gap-6">
            <PaginationItem>
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
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
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </PageShell>
  )
}
