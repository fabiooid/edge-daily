import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import CoverArt from '@/components/cover-art'
import { formatLongDate, type StoryRegion, type StoryTheme } from '@/lib/story-meta'
import { cn } from '@/lib/utils'

export type StoryCardModel = {
  href: string
  title: string
  standfirst: string
  date?: string | Date | null
  minutes: number
  theme: StoryTheme
  region: StoryRegion
  seed: string
}

export default function StoryCard({
  story,
  featured = false,
}: {
  story: StoryCardModel
  featured?: boolean
}) {
  return (
    <Link href={story.href} className="group block h-full">
      <Card
        className={cn(
          'h-full gap-0 overflow-hidden py-0 ring-foreground/10 transition duration-200 group-hover:-translate-y-1 group-hover:ring-foreground/25',
          featured && 'md:grid md:grid-cols-2 md:items-stretch',
        )}
      >
        <CoverArt
          seed={story.seed}
          theme={story.theme}
          region={story.region}
          className={cn(featured ? 'aspect-[16/10] md:aspect-auto md:min-h-[360px]' : 'aspect-[16/10]')}
        />
        <CardContent className={cn('flex flex-col gap-3 p-5', featured && 'justify-center p-6 md:p-10')}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{story.theme}</Badge>
            <Badge variant="outline">{story.region}</Badge>
          </div>
          <h2
            className={cn(
              'font-heading font-bold tracking-tight text-balance group-hover:underline',
              featured ? 'text-3xl md:text-5xl md:leading-[1.1]' : 'text-xl leading-snug md:text-2xl',
            )}
          >
            {story.title}
          </h2>
          <p className={cn('text-muted-foreground', featured ? 'text-base leading-7 md:text-lg' : 'text-sm leading-6')}>
            {story.standfirst}
          </p>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {story.date ? formatLongDate(story.date) : 'This week'}
            {' · '}
            {story.minutes} min read
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
