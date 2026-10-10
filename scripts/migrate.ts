import { mkdir, readFile } from 'node:fs/promises'
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
  const file = path.join(process.cwd(), 'drizzle/migrations/0000_init.sql')
  const sql = await readFile(file, 'utf8')
  await execScript(sql)
  console.log('Migrations applied')
  await closeDb()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
