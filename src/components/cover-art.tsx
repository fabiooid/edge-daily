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
  'Hong Kong': ['#1c3333', '#c9a36a', '#2f5552'],
  China: ['#3a2618', '#d7b07a', '#6b3d28'],
  India: ['#3d241c', '#e09a62', '#7a4030'],
  Japan: ['#222838', '#8fa4c8', '#3c465c'],
  Korea: ['#2c2233', '#c48aa0', '#4a3550'],
  Singapore: ['#1d3228', '#7dba9a', '#315544'],
  Taiwan: ['#243040', '#7ea0c4', '#3c5064'],
  'Southeast Asia': ['#28331d', '#b7c56a', '#46562e'],
  Asia: ['#2a241c', '#c4b08a', '#4a4032'],
  Global: ['#262626', '#b8b2a6', '#3f3f3f'],
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
  const cx1 = 10 + (hash % 70)
  const cy1 = 8 + ((hash >> 5) % 55)
  const cx2 = 40 + ((hash >> 9) % 55)
  const cy2 = 30 + ((hash >> 13) % 50)
  const rotate = (hash >> 17) % 40

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
          <radialGradient id={`${id}-orb`} cx={`${cx1}%`} cy={`${cy1}%`} r="55%">
            <stop offset="0%" stopColor={b} stopOpacity="0.85" />
            <stop offset="100%" stopColor={b} stopOpacity="0" />
          </radialGradient>
          <pattern id={`${id}-grid`} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" stroke="white" strokeOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="160" height="100" fill={`url(#${id}-base)`} />
        <circle cx={cx2} cy={cy2} r="48" fill={`url(#${id}-orb)`} />
        <g transform={`rotate(${rotate} 80 50)`} stroke="white" strokeOpacity="0.12" fill="none">
          <path d="M-10 20 C40 0,120 40,170 18" />
          <path d="M-10 70 C50 90,110 40,170 78" />
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
