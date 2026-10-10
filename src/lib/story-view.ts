import type { EditionStoryView, EditionView } from '@/lib/queries/editions'
import type { StoryCardModel } from '@/components/story-card'
import { isStoredPlace } from '@/lib/pipeline/place'
import { inferTheme, readingMinutes, type StoryRegion } from '@/lib/story-meta'

export function storedPlace(story: Pick<EditionStoryView, 'place'>): StoryRegion {
  return isStoredPlace(story.place) ? story.place : 'Global'
}

export function toStoryCard(
  edition: EditionView,
  story: EditionStoryView,
): StoryCardModel {
  const theme = inferTheme('AI')
  const region = storedPlace(story)
  return {
    href: `/editions/${edition.editionWeek}/${story.slug}`,
    title: story.headline,
    standfirst: story.whyItMatters,
    date: edition.publishedAt,
    minutes: readingMinutes(story.body, story.whyItMatters),
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
