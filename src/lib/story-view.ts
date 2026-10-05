import type { EditionStoryView, EditionView } from '@/lib/queries/editions'
import type { StoryCardModel } from '@/components/story-card'
import { inferRegion, inferTheme, readingMinutes } from '@/lib/story-meta'

export function toStoryCard(
  edition: EditionView,
  story: EditionStoryView,
): StoryCardModel {
  const theme = inferTheme('AI', story.headline, story.body, story.asiaAngle)
  const region = inferRegion(story.headline, story.body, story.asiaAngle, story.isAsia ? 'Asia' : '')
  return {
    href: `/editions/${edition.editionWeek}/${story.slug}`,
    title: story.headline,
    standfirst: story.whyItMatters,
    date: edition.publishedAt,
    minutes: readingMinutes(story.body, story.whyItMatters, story.asiaAngle),
    theme,
    region,
    seed: story.slug,
  }
}

export function storySections(story: EditionStoryView) {
  return [
    { id: 'story', label: 'The story' },
    { id: 'why-it-matters', label: 'Why it matters here' },
    ...(story.citations.length > 0 ? [{ id: 'sources', label: 'Sources' }] : []),
  ]
}
