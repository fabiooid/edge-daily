import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  vector,
} from 'drizzle-orm/pg-core'

export const sources = pgTable('sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  url: text('url'),
  feedUrl: text('feed_url'),
  type: text('type').notNull(),
  region: text('region').notNull(),
  tier: text('tier').notNull(),
  weight: integer('weight').notNull().default(50),
  status: text('status').notNull().default('paused'),
  paywall: text('paywall'),
  notes: text('notes'),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  lastOkAt: timestamp('last_ok_at', { withTimezone: true }),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const items = pgTable('items', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull(),
  url: text('url').notNull(),
  canonicalUrl: text('canonical_url').notNull().unique(),
  title: text('title').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  excerpt: text('excerpt'),
  bodyText: text('body_text'),
  isPaywalled: boolean('is_paywalled').notNull().default(false),
  isSignal: boolean('is_signal').notNull().default(false),
  lang: text('lang'),
  hnPoints: integer('hn_points'),
  embedding: vector('embedding', { dimensions: 1536 }),
})

export const itemTags = pgTable('item_tags', {
  itemId: text('item_id').primaryKey(),
  isAi: boolean('is_ai'),
  topic: text('topic'),
  region: text('region'),
  storyType: text('story_type'),
  classifierModel: text('classifier_model'),
})

export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary'),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
  embedding: vector('embedding', { dimensions: 1536 }),
  status: text('status').notNull().default('candidate'),
  dropReason: text('drop_reason'),
})

export const storyItems = pgTable('story_items', {
  storyId: text('story_id').notNull(),
  itemId: text('item_id').notNull(),
  role: text('role').notNull().default('supporting'),
})

export const editions = pgTable('editions', {
  id: text('id').primaryKey(),
  editionWeek: text('edition_week').notNull().unique(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  windowEnd: timestamp('window_end', { withTimezone: true }).notNull(),
  sendAt: timestamp('send_at', { withTimezone: true }),
  status: text('status').notNull().default('draft'),
  modeUsed: text('mode_used').notNull().default('manual'),
  previewToken: text('preview_token').notNull().unique(),
  lede: jsonb('lede').$type<string[]>(),
  tryThis: jsonb('try_this').$type<{ title: string; body: string; url: string } | null>(),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  configSnapshot: jsonb('config_snapshot').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const editionStories = pgTable(
  'edition_stories',
  {
    id: text('id').primaryKey(),
    editionId: text('edition_id').notNull(),
    storyId: text('story_id'),
    position: integer('position').notNull(),
    section: text('section').notNull().default('main'),
    isAsia: boolean('is_asia').notNull().default(false),
    place: text('place').notNull().default('Global'),
    slug: text('slug').notNull(),
    headline: text('headline').notNull(),
    body: text('body').notNull(),
    whyItMatters: text('why_it_matters').notNull(),
    asiaAngle: text('asia_angle'),
  },
  (table) => [unique().on(table.editionId, table.slug)],
)

export const citations = pgTable('citations', {
  id: text('id').primaryKey(),
  editionStoryId: text('edition_story_id').notNull(),
  sentenceIndex: integer('sentence_index').notNull().default(0),
  itemId: text('item_id'),
  title: text('title').notNull(),
  url: text('url').notNull(),
  quoteOrEvidence: text('quote_or_evidence'),
  isPrimary: boolean('is_primary').notNull().default(false),
})

export const evalRuns = pgTable('eval_runs', {
  id: text('id').primaryKey(),
  editionId: text('edition_id').notNull(),
  stage: text('stage').notNull(),
  model: text('model'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  passed: boolean('passed').notNull(),
  scoreTotal: numeric('score_total'),
})

export const evalResults = pgTable('eval_results', {
  id: text('id').primaryKey(),
  evalRunId: text('eval_run_id').notNull(),
  checkName: text('check_name').notNull(),
  blocking: boolean('blocking').notNull(),
  passed: boolean('passed').notNull(),
  score: numeric('score'),
  detail: text('detail'),
})

export const approvals = pgTable('approvals', {
  id: text('id').primaryKey(),
  editionId: text('edition_id').notNull(),
  channel: text('channel').notNull(),
  action: text('action').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const edits = pgTable('edits', {
  id: text('id').primaryKey(),
  editionId: text('edition_id').notNull(),
  editionStoryId: text('edition_story_id'),
  before: text('before'),
  after: text('after'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const subscribers = pgTable('subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: text('status').notNull().default('pending'),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sends = pgTable('sends', {
  id: text('id').primaryKey(),
  editionId: text('edition_id').notNull(),
  channel: text('channel').notNull(),
  providerId: text('provider_id'),
  sentCount: integer('sent_count').notNull().default(0),
  opens: integer('opens'),
  clicks: integer('clicks'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
})

export const postsArchive = pgTable('posts_archive', {
  id: text('id').primaryKey(),
  legacyId: integer('legacy_id'),
  legacySlug: text('legacy_slug').notNull().unique(),
  theme: text('theme').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  links: jsonb('links').$type<{ title: string; url: string }[]>().notNull().default([]),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }),
})

export const xAccounts = pgTable('x_accounts', {
  handle: text('handle').primaryKey(),
  displayName: text('display_name').notNull(),
  accountType: text('account_type'),
  region: text('region'),
  tier: text('tier').notNull(),
  status: text('status').notNull().default('paused'),
  notes: text('notes'),
})

export const xQueries = pgTable('x_queries', {
  id: text('id').primaryKey(),
  query: text('query').notNull(),
  status: text('status').notNull().default('paused'),
})
