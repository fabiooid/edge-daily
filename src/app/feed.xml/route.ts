import { site, siteUrl } from '../../../config/site'
import { getPublishedEditions } from '@/lib/queries/editions'
import { formatWeekDisplay } from '@/lib/story-meta'

export const dynamic = 'force-dynamic'

export async function GET() {
  const base = siteUrl()
  let items = ''
  try {
    const editions = await getPublishedEditions()
    items = editions
      .map((edition) => {
        const link = `${base}/editions/${edition.editionWeek}`
        const date = edition.publishedAt?.toUTCString() || new Date().toUTCString()
        return `<item>
  <title>${site.name} ${formatWeekDisplay(edition.editionWeek)}</title>
  <link>${link}</link>
  <guid>${link}</guid>
  <pubDate>${date}</pubDate>
  <description><![CDATA[${edition.lede.join(' ')}]]></description>
</item>`
      })
      .join('\n')
  } catch {
    items = ''
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${site.name}</title>
  <link>${base}</link>
  <description>${site.description}</description>
  ${items}
</channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
