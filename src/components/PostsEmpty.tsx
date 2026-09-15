import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

interface PostsEmptyProps {
  title?: string
  description?: string
}

export default function PostsEmpty({
  title = 'No posts yet.',
  description = 'Check back on Monday for the first AI post!',
}: PostsEmptyProps) {
  return (
    <Empty className="border-none py-24">
      <EmptyHeader>
        <EmptyTitle className="text-lg font-normal text-muted-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
