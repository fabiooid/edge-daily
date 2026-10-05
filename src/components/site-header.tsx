'use client'

import Link from 'next/link'
import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Logo from '@/components/logo'
import ThemeToggle from '@/components/theme-toggle'
import { site } from '../../config/site'

const links = [
  { href: '/archive', label: 'Archive' },
  { href: '/about', label: 'About' },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-3 text-foreground no-underline">
          <Logo size={22} />
          <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />} nativeButton={false}>
              {link.label}
            </Button>
          ))}
          <Button size="sm" render={<a href="#subscribe" />} nativeButton={false}>
            Subscribe
          </Button>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>{site.name} pages</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4">
                {links.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start"
                    render={<Link href={link.href} />}
                    nativeButton={false}
                  >
                    {link.label}
                  </Button>
                ))}
                <Button render={<a href="#subscribe" />} nativeButton={false}>
                  Subscribe
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
