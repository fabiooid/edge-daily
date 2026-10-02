import Link from 'next/link'
import Logo from '@/components/logo'
import ThemeToggle from '@/components/theme-toggle'

export default function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-border px-6 py-6 sm:px-8">
      <Link href="/" className="flex items-center gap-3 text-foreground no-underline">
        <Logo size={24} />
        <span className="text-base font-semibold">Edge Weekly</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/archive" className="text-muted-foreground hover:text-foreground">
          Archive
        </Link>
        <Link href="/about" className="text-muted-foreground hover:text-foreground">
          About
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}
