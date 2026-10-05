import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NewsletterSignup from '@/components/newsletter-signup'
import Logo from '@/components/logo'
import { site } from '../../config/site'

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <p className="font-semibold">{site.name}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The AI week, wherever it lands. A short Tuesday briefing of global AI
            news, with each story tagged by place.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Explore</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li><Link href="/" className="hover:underline">This week</Link></li>
            <li><Link href="/archive" className="hover:underline">Archive</Link></li>
            <li><Link href="/about" className="hover:underline">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Follow</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li>
              <a href="/feed.xml" className="hover:underline">RSS</a>
            </li>
            <li>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                X
              </a>
            </li>
            <li>
              <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Anthropic
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Subscribe</p>
          <p className="mt-4 mb-4 text-sm leading-6 text-muted-foreground">
            One email a week. No daily noise.
          </p>
          <NewsletterSignup compact idPrefix="footer" />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>Written in Hong Kong. Sources first. Please check them before you act.</p>
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0"
            render={<a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
          >
            Powered by Anthropic
          </Button>
        </div>
      </div>
    </footer>
  )
}
