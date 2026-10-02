import { afterEach, describe, expect, it } from 'vitest'
import { authorizeAdmin, authorizeTelegram } from '../src/lib/auth'

const original = { ...process.env }

afterEach(() => {
  process.env.ADMIN_API_KEY = original.ADMIN_API_KEY
  process.env.TELEGRAM_WEBHOOK_SECRET = original.TELEGRAM_WEBHOOK_SECRET
})

describe('fail-closed admin', () => {
  it('rejects every request when ADMIN_API_KEY is unset', () => {
    delete process.env.ADMIN_API_KEY
    expect(authorizeAdmin(undefined as unknown as string)).toMatchObject({ ok: false, status: 503 })
    expect(authorizeAdmin(null)).toMatchObject({ ok: false })
  })

  it('rejects a wrong key', () => {
    process.env.ADMIN_API_KEY = 'secret'
    expect(authorizeAdmin('nope')).toMatchObject({ ok: false, status: 401 })
    expect(authorizeAdmin('secret')).toMatchObject({ ok: true })
  })

  it('rejects Telegram when the webhook secret is unset', () => {
    delete process.env.TELEGRAM_WEBHOOK_SECRET
    expect(authorizeTelegram('anything')).toMatchObject({ ok: false, status: 503 })
  })
})
