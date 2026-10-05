export const site = {
  name: 'Meridian',
  subtitle: 'the AI week, wherever it lands',
  description:
    'The week of AI news, wherever it lands, with a clear take on why it matters. Each story is tagged by place. Ten minutes, once a week.',
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
