import { createHash, randomBytes } from 'node:crypto'

export function id(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString('hex')}`
}

export function hashId(prefix: string, value: string): string {
  return `${prefix}_${createHash('sha1').update(value).digest('hex').slice(0, 16)}`
}

export function previewToken(): string {
  return randomBytes(18).toString('hex')
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'story'
}
