import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageShellProps {
  className?: string
  children: ReactNode
}

export default function PageShell({ className, children }: PageShellProps) {
  return (
    <main className={cn('mx-auto max-w-[720px] px-8 py-16', className)}>
      {children}
    </main>
  )
}
