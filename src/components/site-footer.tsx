import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import NewsletterSignup from '@/components/newsletter-signup'

export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-8 py-12">
        <NewsletterSignup />
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Edge Weekly uses AI to curate the week of AI news that matters in Asia.
            A person approves every edition before it goes live, unless auto-publish
            is on and the eval bar is met. Please verify information through the
            provided sources.
          </p>
          <Button
            variant="link"
            size="sm"
            render={
              <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer" />
            }
            nativeButton={false}
          >
            Powered by Anthropic
          </Button>
        </div>
      </div>
    </footer>
  )
}
