import { Separator } from '@/components/ui/separator'

export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-8 py-12 text-center">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Edge Weekly uses AI to curate the week of AI news that matters in Asia.
          A person approves every edition before it goes live. Please verify
          information through the provided sources.
        </p>
        <a
          href="https://www.anthropic.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-foreground/20 pb-px text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          Powered by Anthropic
        </a>
      </div>
    </footer>
  )
}
