import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  parseArchiveLinks,
  shouldImportArchivePost,
  type RawArchivePost,
} from '../src/lib/archive'
import { closeDb, getDb } from '../src/lib/db'
import { postsArchive } from '../src/lib/db/schema'

async function main() {
  const db = await getDb()
  const raw = await readFile(path.join(process.cwd(), 'data/archive_posts.json'), 'utf8')
  const posts = JSON.parse(raw) as RawArchivePost[]
  let imported = 0
  let skipped = 0

  for (const post of posts) {
    if (!shouldImportArchivePost(post)) {
      skipped += 1
      continue
    }
    await db
      .insert(postsArchive)
      .values({
        id: `v1_${post.slug}`,
        legacyId: post.id,
        legacySlug: post.slug,
        theme: post.theme,
        title: post.title,
        content: post.content,
        links: parseArchiveLinks(post.links),
        date: post.date,
        createdAt: new Date(post.created_at),
      })
      .onConflictDoUpdate({
        target: postsArchive.legacySlug,
        set: {
          theme: post.theme,
          title: post.title,
          content: post.content,
          links: parseArchiveLinks(post.links),
          date: post.date,
        },
      })
    imported += 1
  }

  console.log(`Archive import complete. Imported ${imported}, skipped ${skipped}.`)
  await closeDb()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
