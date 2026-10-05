import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { approvals, editions } from '../db/schema'
import { id } from '../ids'

export async function applyEditionAction(input: {
  editionWeek: string
  action: 'approve' | 'reject' | 'changes'
  channel: 'telegram' | 'admin'
  note?: string
}): Promise<{ ok: boolean; status: string; error?: string }> {
  const db = await getDb()
  const rows = await db.select().from(editions).where(eq(editions.editionWeek, input.editionWeek))
  const edition = rows[0]
  if (!edition) return { ok: false, status: 'missing', error: 'Edition not found' }

  if (input.action === 'approve') {
    const evalPassed = edition.status === 'in_review' || edition.status === 'draft'
    if (!evalPassed && edition.status !== 'held') {
      return { ok: false, status: edition.status, error: 'This edition cannot be approved in its current state' }
    }
    await db
      .update(editions)
      .set({
        status: 'published',
        approvedBy: input.channel,
        approvedAt: new Date(),
        publishedAt: new Date(),
      })
      .where(eq(editions.id, edition.id))
  } else if (input.action === 'reject') {
    await db
      .update(editions)
      .set({ status: 'rejected', approvedBy: input.channel, approvedAt: new Date() })
      .where(eq(editions.id, edition.id))
  } else {
    await db.update(editions).set({ status: 'draft' }).where(eq(editions.id, edition.id))
  }

  await db.insert(approvals).values({
    id: id('appr'),
    editionId: edition.id,
    channel: input.channel,
    action: input.action === 'changes' ? 'request_changes' : input.action,
    note: input.note,
  })

  return { ok: true, status: input.action === 'approve' ? 'published' : input.action === 'reject' ? 'rejected' : 'draft' }
}
