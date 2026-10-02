import { Separator } from '@/components/ui/separator'

export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-8 py-12 text-center">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Edge Weekly uses AI to draft the week of AI news that matters in Asia.
          A person approves every edition before it goes live. Please check the
          linked sources before you act on a story.
        </p>
        <p className="text-xs text-muted-foreground">Written in Hong Kong</p>
      </div>
    </footer>
  )
}
