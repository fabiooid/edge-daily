'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import StatusAlert from '@/components/status-alert'
import { cn } from '@/lib/utils'

export default function NewsletterSignup({
  compact = false,
  idPrefix = 'newsletter',
}: {
  compact?: boolean
  idPrefix?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setStatus('error')
        setMessage(body.error || 'That email could not be saved.')
        return
      }
      setStatus('ok')
      setMessage('You are on the list. The next edition will go to this inbox when email send is turned on.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('The signup form could not reach the server.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={onSubmit}
        className={cn('flex flex-col gap-3', compact ? '' : 'sm:flex-row sm:items-end')}
      >
        <div className="grid flex-1 gap-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Subscribe'}
        </Button>
      </form>
      {status === 'ok' && <StatusAlert tone="empty" title="Saved" description={message} />}
      {status === 'error' && <StatusAlert tone="error" title="Could not subscribe" description={message} />}
    </div>
  )
}
