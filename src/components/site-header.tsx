import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Logo from '@/components/logo'
import ThemeToggle from '@/components/theme-toggle'

export default function SiteHeader() {
  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-border px-8 py-6">
      <Link href="/" className="flex items-center gap-3 text-foreground no-underline">
        <Logo size={24} />
        <span className="text-base font-semibold">Edge Weekly</span>
      </Link>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" render={<Link href="/archive" />} nativeButton={false}>
          Archive
        </Button>
        <Button variant="ghost" size="sm" render={<Link href="/about" />} nativeButton={false}>
          About
        </Button>
        <ThemeToggle />
      </div>
    </nav>
  )
}
