import { desc, eq } from 'drizzle-orm'
import { getDb } from '../db'
import { approvals, editions, evalRuns } from '../db/schema'
import { id } from '../ids'
import { canApproveEdition } from './approve'

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
    const [run] = await db
      .select()
      .from(evalRuns)
      .where(eq(evalRuns.editionId, edition.id))
      .orderBy(desc(evalRuns.createdAt))
    const gate = canApproveEdition({ status: edition.status, evalPassed: Boolean(run?.passed) })
    if (!gate.ok) {
      return { ok: false, status: edition.status, error: gate.error }
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
