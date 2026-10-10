import { readdir, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { closeDb, execScript, isProductionRuntime } from '../src/lib/db'

async function main() {
  if (!process.env.DATABASE_URL && isProductionRuntime()) {
    throw new Error('DATABASE_URL is required in production')
  }
  if (!process.env.DATABASE_URL) {
    const dataDir = process.env.PGLITE_PATH || '.data/meridian'
    await mkdir(path.dirname(dataDir), { recursive: true })
  }
  const dir = path.join(process.cwd(), 'drizzle/migrations')
  const files = (await readdir(dir)).filter((file) => file.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = await readFile(path.join(dir, file), 'utf8')
    await execScript(sql)
  }
  console.log(`Migrations applied (${files.length})`)
  await closeDb()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
