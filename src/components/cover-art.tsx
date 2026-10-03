import { CpuIcon, GlobeIcon, WalletIcon, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hashSeed, type StoryRegion, type StoryTheme } from '@/lib/story-meta'

const THEME_ICON = {
  AI: CpuIcon,
  Web3: GlobeIcon,
  Fintech: WalletIcon,
  Energy: ZapIcon,
} as const

const PALETTES: Record<StoryRegion, [string, string, string]> = {
  'Hong Kong': ['#0b3f3b', '#f2c56a', '#1f8f7c'],
  China: ['#5a1d12', '#f0b15c', '#c85a24'],
  India: ['#6a2610', '#ffb068', '#d86a2a'],
  Japan: ['#152544', '#7eb6ea', '#3b5f96'],
  Korea: ['#3b1638', '#ee9ab8', '#83406e'],
  Singapore: ['#0d4634', '#5fd6a2', '#1f8d64'],
  Taiwan: ['#13324d', '#6eb8ee', '#2b6288'],
  'Southeast Asia': ['#2a4412', '#d7e45c', '#6f9224'],
  Asia: ['#123c38', '#ebc06a', '#2f7a68'],
  Global: ['#172038', '#9cb6dc', '#3a4f78'],
}

export default function CoverArt({
  seed,
  theme,
  region,
  className,
  compact = false,
}: {
  seed: string
  theme: StoryTheme
  region: StoryRegion
  className?: string
  compact?: boolean
}) {
  const hash = hashSeed(seed)
  const [a, b, c] = PALETTES[region]
  const id = `cover-${hash.toString(16)}`
  const Icon = THEME_ICON[theme]
  const cx1 = 18 + (hash % 50)
  const cy1 = 12 + ((hash >> 5) % 40)
  const cx2 = 70 + ((hash >> 9) % 40)
  const cy2 = 55 + ((hash >> 13) % 30)
  const rotate = 8 + ((hash >> 17) % 24)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-foreground text-primary-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={c} />
          </linearGradient>
          <radialGradient id={`${id}-orb`} cx={`${cx1}%`} cy={`${cy1}%`} r="62%">
            <stop offset="0%" stopColor={b} stopOpacity="0.95" />
            <stop offset="100%" stopColor={b} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-orb2`} cx={`${cx2}%`} cy={`${cy2}%`} r="48%">
            <stop offset="0%" stopColor={c} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
          <pattern id={`${id}-grid`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0H0V14" fill="none" stroke="white" strokeOpacity="0.14" />
          </pattern>
        </defs>
        <rect width="160" height="100" fill={`url(#${id}-base)`} />
        <circle cx={cx1} cy={cy1} r="62" fill={`url(#${id}-orb)`} />
        <circle cx={cx2} cy={cy2} r="46" fill={`url(#${id}-orb2)`} />
        <g transform={`rotate(${rotate} 80 50)`} stroke={b} strokeOpacity="0.35" fill="none" strokeWidth="1.2">
          <path d="M-10 22 C40 2,120 42,170 20" />
          <path d="M-10 72 C50 92,110 42,170 80" />
        </g>
        <rect width="160" height="100" fill={`url(#${id}-grid)`} />
      </svg>
      <div className={cn('relative flex h-full flex-col justify-between p-4', compact && 'p-3')}>
        <div className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.16em] uppercase">
          <Icon className={cn('size-4', compact && 'size-3.5')} />
          <span>{theme}</span>
        </div>
        <p className={cn('font-heading font-semibold tracking-tight', compact ? 'text-lg' : 'text-2xl md:text-3xl')}>
          {region}
        </p>
      </div>
    </div>
  )
}
