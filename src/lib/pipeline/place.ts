import type { StoryRegion } from '../story-meta'

const CODE_TO_PLACE: Record<string, StoryRegion> = {
  hk: 'Hong Kong',
  'hong kong': 'Hong Kong',
  cn: 'China',
  china: 'China',
  jp: 'Japan',
  japan: 'Japan',
  kr: 'Korea',
  korea: 'Korea',
  in: 'India',
  india: 'India',
  sea: 'Southeast Asia',
  'southeast asia': 'Southeast Asia',
  tw: 'Taiwan',
  taiwan: 'Taiwan',
  sg: 'Singapore',
  singapore: 'Singapore',
  asia: 'Asia',
  us: 'United States',
  usa: 'United States',
  'united states': 'United States',
  uk: 'United Kingdom',
  'united kingdom': 'United Kingdom',
  eu: 'Europe',
  europe: 'Europe',
  africa: 'Africa',
  'latin america': 'Latin America',
  'middle east': 'Middle East',
  global: 'Global',
  'global south': 'Global',
}

const ASIA_PLACES = new Set<StoryRegion>([
  'Hong Kong',
  'China',
  'India',
  'Japan',
  'Korea',
  'Singapore',
  'Taiwan',
  'Southeast Asia',
  'Asia',
])

const SOURCE_REGION_ALIASES: Record<string, StoryRegion> = {
  'global (us)': 'United States',
  'global (uk/us)': 'United Kingdom',
  'global (uk)': 'United Kingdom',
  'global (eu)': 'Europe',
  'global south': 'Global',
  'hk, cn': 'Hong Kong',
  'cn, sea': 'China',
  'cn, jp, kr, in, sea': 'Asia',
  'sea, asia': 'Southeast Asia',
}

/** Map a source's stored region to one place. Does not scan story text for company names. */
export function placeFromSourceRegion(region: string | null | undefined): StoryRegion {
  const raw = (region || '').trim()
  if (!raw) return 'Global'

  const normalized = raw.toLowerCase()
  if (SOURCE_REGION_ALIASES[normalized]) return SOURCE_REGION_ALIASES[normalized]
  if (CODE_TO_PLACE[normalized]) return CODE_TO_PLACE[normalized]

  const firstToken = normalized.split(',')[0]?.trim() || ''
  const withoutParens = firstToken.replace(/\(([^)]+)\)/g, ' $1 ').replace(/global/g, ' ').trim()
  const candidates = [firstToken, withoutParens, ...withoutParens.split(/[/\s]+/)].map((part) => part.trim())

  for (const candidate of candidates) {
    if (candidate && CODE_TO_PLACE[candidate]) return CODE_TO_PLACE[candidate]
  }

  return 'Global'
}

export function isAsiaPlace(place: StoryRegion): boolean {
  return ASIA_PLACES.has(place)
}

export function isStoredPlace(value: string | null | undefined): value is StoryRegion {
  if (!value) return false
  return (
    value === 'Hong Kong' ||
    value === 'China' ||
    value === 'India' ||
    value === 'Japan' ||
    value === 'Korea' ||
    value === 'Singapore' ||
    value === 'Taiwan' ||
    value === 'Southeast Asia' ||
    value === 'Asia' ||
    value === 'United States' ||
    value === 'United Kingdom' ||
    value === 'Europe' ||
    value === 'Africa' ||
    value === 'Latin America' ||
    value === 'Middle East' ||
    value === 'Global'
  )
}
