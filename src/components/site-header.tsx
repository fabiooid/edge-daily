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

const links = [
  { href: '/archive', label: 'Archive' },
  { href: '/about', label: 'About' },
]

export default function SiteHeader() {
  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-border px-8 py-6">
      <Link href="/" className="flex items-center gap-3 text-foreground no-underline">
        <Logo size={24} />
        <span className="text-base font-semibold">Edge Weekly</span>
      </Link>
      <div className="hidden items-center gap-1 sm:flex">
        {links.map((link) => (
          <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />} nativeButton={false}>
            {link.label}
          </Button>
        ))}
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-1 sm:hidden">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" />}
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Edge Weekly pages</SheetDescription>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
