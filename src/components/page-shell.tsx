import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageShellProps {
  className?: string
  width?: 'wide' | 'article'
  children: ReactNode
}

export default function PageShell({ className, width = 'wide', children }: PageShellProps) {
  return (
    <main
      className={cn(
        'mx-auto w-full px-5 py-10 md:px-8 md:py-14',
        width === 'wide' ? 'max-w-[1180px]' : 'max-w-[1180px]',
        className,
      )}
    >
      {children}
    </main>
  )
}
