import { z } from 'zod'
import { getDb } from '@/lib/db'
import { subscribers } from '@/lib/db/schema'
import { id } from '@/lib/ids'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  email: z.string().trim().email(),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  try {
    const db = await getDb()
    await db
      .insert(subscribers)
      .values({
        id: id('sub'),
        email: parsed.data.email.toLowerCase(),
        status: 'pending',
        source: 'site',
      })
      .onConflictDoNothing({ target: subscribers.email })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'The list could not be saved right now.' }, { status: 503 })
  }
}
