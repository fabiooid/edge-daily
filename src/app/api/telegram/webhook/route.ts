import { authorizeTelegram } from '@/lib/auth'
import { applyEditionAction } from '@/lib/pipeline/publish'
import {
  answerTelegramCallback,
  parseTelegramCallback,
  telegramFromAllowedChat,
} from '@/lib/pipeline/telegram'

export const dynamic = 'force-dynamic'

type TelegramUpdate = {
  callback_query?: {
    id: string
    data?: string
    from?: { id?: number }
    message?: { chat?: { id?: number } }
  }
  message?: { chat?: { id?: number }; text?: string }
}

export async function POST(request: Request) {
  const auth = authorizeTelegram(request.headers.get('x-telegram-bot-api-secret-token'))
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const update = (await request.json()) as TelegramUpdate
  if (!telegramFromAllowedChat(update)) {
    return Response.json({ ok: true, ignored: true })
  }

  const callback = update.callback_query
  if (!callback) {
    return Response.json({ ok: true })
  }

  const parsed = parseTelegramCallback(callback.data)
  if (!parsed.action || !parsed.editionWeek) {
    return Response.json({ ok: true })
  }

  const result = await applyEditionAction({
    editionWeek: parsed.editionWeek,
    action: parsed.action,
    channel: 'telegram',
  })

  const reply =
    parsed.action === 'approve'
      ? result.ok
        ? 'Published'
        : result.error || 'Could not publish'
      : parsed.action === 'reject'
        ? 'Rejected'
        : 'Marked for changes. Reply with a note in chat.'

  await answerTelegramCallback(callback.id, reply)
  return Response.json({ ok: result.ok, status: result.status })
}
