export const site = {
  name: 'Edge Weekly',
  subtitle: 'the AI week in Asia',
  description:
    'The week of AI news that matters if you live or work in Asia, explained plainly. Ten minutes, once a week.',
  locale: 'en-HK',
  timezone: 'Asia/Hong_Kong',
  defaultUrl: 'http://localhost:3000',
  author: 'Fabio Vella',
} as const

export function siteUrl(): string {
  return (
    process.env.SITE_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    site.defaultUrl
  )
}
