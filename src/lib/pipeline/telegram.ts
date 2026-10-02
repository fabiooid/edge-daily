import { siteUrl } from '../../../config/site'
import { isAllowedTelegramChat } from '../auth'

type InlineButton = {
  text: string
  callback_data: string
}

export function buildPreviewMessage(input: {
  editionWeek: string
  storyCount: number
  headlines: string[]
  previewToken: string
  passed: boolean
}): { text: string; buttons: InlineButton[][] } {
  const url = `${siteUrl()}/preview/${input.previewToken}`
  const lines = [
    `Edge Weekly preview: ${input.editionWeek}`,
    `${input.storyCount} stories ready for review.`,
    input.passed ? 'Blocking checks passed.' : 'Blocking checks failed. Do not approve until this is fixed.',
    '',
    ...input.headlines.map((headline, index) => `${index + 1}. ${headline}`),
    '',
    `Preview: ${url}`,
  ]
  return {
    text: lines.join('\n'),
    buttons: [
      [
        { text: 'Approve', callback_data: `approve:${input.editionWeek}` },
        { text: 'Reject', callback_data: `reject:${input.editionWeek}` },
      ],
      [{ text: 'Request changes', callback_data: `changes:${input.editionWeek}` }],
    ],
  }
}

export async function sendTelegramPreview(input: {
  editionWeek: string
  storyCount: number
  headlines: string[]
  previewToken: string
  passed: boolean
}): Promise<{ sent: boolean; reason?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return { sent: false, reason: 'Telegram is not configured' }
  }
  const message = buildPreviewMessage(input)
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message.text,
      reply_markup: { inline_keyboard: message.buttons },
      disable_web_page_preview: false,
    }),
  })
  if (!response.ok) {
    return { sent: false, reason: `Telegram send failed: ${response.status}` }
  }
  return { sent: true }
}

export async function answerTelegramCallback(callbackId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  })
}

export function parseTelegramCallback(data: string | undefined): {
  action: 'approve' | 'reject' | 'changes' | null
  editionWeek: string | null
} {
  if (!data) return { action: null, editionWeek: null }
  const [action, editionWeek] = data.split(':')
  if (action === 'approve' || action === 'reject' || action === 'changes') {
    return { action, editionWeek: editionWeek || null }
  }
  return { action: null, editionWeek: null }
}

export function telegramFromAllowedChat(update: { message?: { chat?: { id?: number } }; callback_query?: { message?: { chat?: { id?: number } }; from?: { id?: number } } }): boolean {
  const chatId =
    update.callback_query?.message?.chat?.id ??
    update.callback_query?.from?.id ??
    update.message?.chat?.id
  return isAllowedTelegramChat(chatId)
}
