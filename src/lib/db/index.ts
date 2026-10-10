import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Db = ReturnType<typeof drizzlePg>

type Handle = {
  db: Db
  exec: (sql: string, params?: unknown[]) => Promise<unknown>
  execScript: (sql: string) => Promise<unknown>
  close: () => Promise<void>
}

let cached: Handle | null = null

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.ALLOW_PGLITE !== 'true'
}

export async function getHandle(): Promise<Handle> {
  if (cached) return cached

  const url = process.env.DATABASE_URL
  if (url) {
    const client = postgres(url, { max: 4, idle_timeout: 20 })
    cached = {
      db: drizzlePg(client, { schema }),
      exec: async (sql, params = []) => client.unsafe(sql, params as (string | number | boolean | null)[]),
      execScript: async (sql) => client.unsafe(sql),
      close: async () => {
        await client.end()
      },
    }
    return cached
  }

  if (isProductionRuntime()) {
    throw new Error('DATABASE_URL is required in production')
  }

  const { mkdir } = await import('node:fs/promises')
  const path = await import('node:path')
  const { PGlite } = await import('@electric-sql/pglite')
  const { vector } = await import('@electric-sql/pglite/vector')
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite')
  const dataDir = process.env.PGLITE_PATH || '.data/meridian'
  await mkdir(path.dirname(dataDir), { recursive: true })
  const client = new PGlite(dataDir, { extensions: { vector } })
  cached = {
    db: drizzlePglite(client, { schema }) as unknown as Db,
    exec: async (sql, params = []) => client.query(sql, params),
    execScript: async (sql) => client.exec(sql),
    close: async () => {
      await client.close()
    },
  }
  return cached
}

export async function getDb(): Promise<Db> {
  const handle = await getHandle()
  return handle.db
}

export async function execSql(sql: string, params: unknown[] = []): Promise<unknown> {
  const handle = await getHandle()
  return handle.exec(sql, params)
}

export async function execScript(sql: string): Promise<unknown> {
  const handle = await getHandle()
  return handle.execScript(sql)
}

export async function closeDb(): Promise<void> {
  if (cached) await cached.close()
  cached = null
}
