import type { Link } from './schemas.ts'

export async function validateLinks(links: Link[]) {
  const results = await Promise.all(
    links.map(async (link) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        const res = await fetch(link.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        })
        clearTimeout(timeout)
        if (res.status === 404) throw new Error('404 Not Found')
        return { link, ok: true as const }
      } catch (err) {
        return {
          link,
          ok: false as const,
          reason: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    })
  )

  const failed = results.filter((r) => !r.ok)
  if (failed.length > 0) {
    console.warn(`⚠️ ${failed.length} link(s) failed validation (will still publish):`)
    for (const result of failed) {
      if (!result.ok) console.warn(`  ${result.link.url} → ${result.reason}`)
    }
  }

  if (failed.length === links.length) {
    throw new Error('All links failed validation — aborting post')
  }
}
