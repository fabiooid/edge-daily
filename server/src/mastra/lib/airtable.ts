import type { Theme } from '../lib/theme.ts'
import type { Link } from '../lib/schemas.ts'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID

const BLOCKLISTED_DOMAINS = [
  'google.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'linkedin.com',
  'reddit.com',
  'youtube.com',
  'wikipedia.org',
]

async function airtableFetch(path: string, init?: RequestInit) {
  const token = process.env.AIRTABLE_TOKEN
  if (!token || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    throw new Error('Airtable env vars are missing')
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Airtable request failed: ${res.status}`)
  }

  return res.json()
}

export async function fetchApprovedSources() {
  const data = await airtableFetch(`?filterByFormula=%7BStatus%7D%3D'Active'`)
  const sources: Record<Theme, string[]> = {
    AI: [],
    Web3: [],
    Fintech: [],
    Energy: [],
  }

  for (const record of data.records) {
    const { Domain, Theme: themeField } = record.fields
    if (!Domain || !themeField) continue
    const themes = Array.isArray(themeField) ? themeField : [themeField]
    for (const theme of themes) {
      if (sources[theme as Theme]) sources[theme as Theme].push(Domain)
    }
  }

  console.log(
    '📋 Loaded sources from Airtable:',
    Object.entries(sources)
      .map(([k, v]) => `${k}(${v.length})`)
      .join(', ')
  )

  return sources
}

export async function fetchRejectedDomains() {
  const data = await airtableFetch(`?filterByFormula=%7BStatus%7D%3D'Rejected'`)
  return data.records.map((r: { fields: { Domain?: string } }) => r.fields.Domain).filter(Boolean)
}

async function fetchAllDomains() {
  const data = await airtableFetch('')
  return new Set(
    data.records
      .map((r: { fields: { Domain?: string } }) => r.fields.Domain)
      .filter(Boolean)
  )
}

export async function suggestNewSources(links: Link[], theme: Theme) {
  try {
    const allDomains = await fetchAllDomains()
    let suggested = 0

    for (const link of links) {
      if (suggested >= 2) break
      let domain: string
      try {
        domain = new URL(link.url).hostname.replace(/^www\./, '')
      } catch {
        continue
      }

      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) continue
      if (allDomains.has(domain)) continue
      if (BLOCKLISTED_DOMAINS.includes(domain)) continue

      await airtableFetch('', {
        method: 'POST',
        body: JSON.stringify({
          fields: {
            Domain: domain,
            Theme: [theme],
            Status: 'Pending',
            Notes: `Auto-suggested from post on ${new Date().toISOString().slice(0, 10)}`,
          },
        }),
      })

      console.log(`💡 Suggested new source: ${domain} (Pending review)`)
      suggested++
    }
  } catch (err) {
    console.warn(
      '⚠️ Skipping source suggestions:',
      err instanceof Error ? err.message : err
    )
  }
}
