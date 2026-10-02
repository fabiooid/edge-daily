# Edge Weekly

**Edge Weekly: the AI week in Asia.**

A weekly briefing of the AI news that matters if you live or work in Asia. Ten minutes, once a week, published on Tuesday morning Hong Kong time.

This repo is a rebuild of the old Edge Daily site. Milestone 1 is a working end-to-end weekly edition: a Next.js site, Postgres, a Node pipeline you run as a CLI, blocking checks before approval, and a Telegram approve / reject / request-changes flow.

## What you need to set up by hand

1. Create a Railway project and add a Postgres plugin, **or** create a Neon database. Copy the `DATABASE_URL`.
2. Create a Telegram bot with [BotFather](https://t.me/BotFather). Copy the bot token. Send the bot a message, then note your chat id.
3. Create an Anthropic API key.
4. Set the env vars below on the Railway web service and on the Railway cron service.
5. Point the Telegram webhook at `https://YOUR-RAILWAY-HOST/api/telegram/webhook` with a secret token header.
6. Run migrate, seed sources, and import the v1 archive once.
7. If you still have the old Vercel project, switch it only after Railway is live. Vercel is optional.

## Deploy on Railway (primary)

The site is a normal Node Next.js app. The weekly pipeline is the same repo, started as a cron service that runs a CLI script. There is no cron inside the web process.

### 1. Web service

1. New Railway project from this GitHub repo.
2. Add a Postgres plugin, or paste a Neon `DATABASE_URL`.
3. Use the Dockerfile in the repo (`railway.json` already points at it).
4. Set these variables on the **web** service:

```
DATABASE_URL=
SITE_URL=https://YOUR-APP.up.railway.app
ADMIN_API_KEY=
ANTHROPIC_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
PUBLISH_MODE=manual
PROCESS_ROLE=web
```

5. Generate a public URL. That URL is `SITE_URL`.
6. After the first deploy, run these from a one-off Railway shell or your laptop with the same `DATABASE_URL`:

```bash
npm run db:migrate
npm run db:seed-sources
npm run db:import-archive
```

### 2. Pipeline cron service

Add a second Railway service from the same repo. Use the same Dockerfile. Override the start command so this service is the CLI, not the website.

**Daily ingest** (05:30 Hong Kong time = 21:30 UTC):

- Start command: `PROCESS_ROLE=pipeline PIPELINE_JOB=ingest node scripts/start.mjs`
- Cron schedule: `30 21 * * *`

**Monday compile** (18:00 Hong Kong time = 10:00 UTC Monday):

You can either add a third service, or change the one cron service's schedule and `PIPELINE_JOB`. A simple setup is two cron services:

- Ingest: `PIPELINE_JOB=ingest`, `30 21 * * *`
- Compile: `PIPELINE_JOB=compile`, `0 10 * * 1`
- Reminder (optional): `PIPELINE_JOB=remind`, `0 23 * * 1` (Tuesday 07:00 HKT)

Give the cron service the same env vars as the web service, plus:

```
PROCESS_ROLE=pipeline
PIPELINE_JOB=compile
```

The compile job writes a draft edition, runs blocking checks, and sends a Telegram preview. Approve publishes the edition page.

### 3. Telegram webhook

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR-APP.up.railway.app/api/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

The webhook only accepts presses from `TELEGRAM_CHAT_ID` and only if the secret header matches. If the secret is missing, the route refuses every request.

You can keep a second always-on Telegram bot on Railway. This app only needs the webhook above.

## Local setup

```bash
npm install
cp .env.example .env
```

Without `DATABASE_URL`, local commands use a file database in `.data/`. That is for demo and tests only.

```bash
npm run demo
npm run dev
```

`npm run demo` migrates, seeds the vetted sources, imports the cleaned v1 archive, and publishes a mock weekly edition so you can click through the site without API keys.

### Pipeline CLI

```bash
npx tsx scripts/pipeline.ts ingest --dry-run
npx tsx scripts/pipeline.ts compile --mock
npx tsx scripts/pipeline.ts remind
```

`--mock` / `--dry-run` writes an edition without calling Anthropic. Use this in CI or when keys are not set.

## Env vars

| Name | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | Yes in production | Railway Postgres or Neon |
| `SITE_URL` | Yes in production | Canonical URL for RSS, sitemap, Telegram |
| `ADMIN_API_KEY` | Yes to trigger by HTTP | Admin routes fail closed if unset |
| `ANTHROPIC_API_KEY` | Yes for live writing | Not needed for `--mock` |
| `TELEGRAM_BOT_TOKEN` | Yes for approval | Bot token |
| `TELEGRAM_CHAT_ID` | Yes for approval | Only this chat can press buttons |
| `TELEGRAM_WEBHOOK_SECRET` | Yes for the webhook | Fail closed if unset |
| `PUBLISH_MODE` | No | `manual` (default) or `auto` |
| `FEATURE_X_SOURCES` | No | Off by default. X costs per read |
| `MODEL_WRITING` | No | Default `claude-sonnet-5-5` |
| `MODEL_CHECKS` | No | Default `claude-haiku-4-5` |

## Sources

The vetted list lives in `data/sources.csv`. Seed it with `npm run db:seed-sources`.

Milestone 1 turns on the Top 10 plus Hacker News (Algolia) as a signal source. Everything else is stored and paused.

Supported source types:

- RSS / Atom
- Hugging Face models API, filtered by author org
- Hacker News via Algolia (signal only: never cited; missing HN attention does not lower an Asia story)
- X, behind `FEATURE_X_SOURCES`, seeded with 25 accounts and search queries, all paused
- Scrape / email placeholders so a later adapter can plug in

## Archive import

`npm run db:import-archive` is safe to run more than once.

It imports the real Edge Daily posts and skips:

- the 16 seed / duplicate rows dated 23 Feb to 5 Mar 2026
- the 6 April DeepSeek post, which had the launch year wrong

Old `/post/:slug` links redirect to `/archive/v1/:slug`.

## Checks and approval

Before an edition can be approved, these blocking checks must pass:

- Freshness (7-day window in code)
- Source floor (two sources, or one primary)
- Style (no em dashes, no hype words, required sections)
- Links resolve (skipped only in mock mode)
- Edition shape (5 to 7 stories, at least two from Asia)

Telegram buttons: Approve, Reject, Request changes. Approve publishes the edition page. `PUBLISH_MODE=manual` is the default.

## Tests

```bash
npm test
```

CI runs tests and a production build on every push.

## Optional: Vercel

Railway is the host. If you still want a Vercel frontend later:

1. Import the repo into Vercel.
2. Set the same env vars, including `DATABASE_URL`.
3. Do **not** put a cron in the Next.js server. Keep the Railway cron service (or the GitHub Actions example below).

There is no Vercel-only cache or image API in this app. Pages render from Postgres on each request so they work the same on Railway.

## Optional: GitHub Actions cron

`.github/workflows/pipeline.example.yml` is a manual alternative. It has no schedule. Railway cron is the one that should run every week.

## Project layout

```
config/                 models, publish mode, source lists
data/                   vetted sources and v1 archive
drizzle/migrations/     Postgres + pgvector schema
scripts/pipeline.ts     CLI used by Railway cron
src/app/                Next.js pages, RSS, sitemap, webhooks
src/lib/pipeline/       ingest, filters, rank, write, checks
src/lib/pipeline/sources/   rss, huggingface, hackernews, x, scrape stub
```
