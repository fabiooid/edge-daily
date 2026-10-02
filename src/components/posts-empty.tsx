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
  title = 'No weekly edition is live yet.',
  description = 'The first Edge Weekly issue publishes after it is approved. Check back on a Tuesday morning Hong Kong time.',
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
