---
title: Meridian product and codebase review
date: 2026-10-10
---

# Meridian product and codebase review

## Summary

The site and weekly pipeline are far enough along to demo, but they are not ready to ship a real Tuesday edition until Railway is set up.

The reader-facing magazine layout, About page, Week 1 numbering, and SVG covers match the product intent. This PR now also locks the five highest-risk pipeline holes: live weeks cannot be overwritten, mock copy cannot ship without `--mock`, Hacker News is a signal on the official story, the same launch is one story with a real second outlet, place is stored, paywalled 403s no longer drop a story, and Approve cannot skip a failed check.

Railway, Postgres, Telegram, the Anthropic key, and crons are still unset. Do not turn on `PUBLISH_MODE=auto` until Fabio has approved several real weeks by hand.

## Issues

### Critical

**C1. Re-running the weekly compile can take a live edition offline** — fixed

Published and in-review weeks are left alone unless `--force` is passed. Drafts can still be replaced. Tests: `tests/compile-guard.test.ts`.

**C2. A missing Anthropic key writes fake copy as if it were real** — fixed

Mock copy runs only with `--mock` or `--dry-run`. A real compile without `ANTHROPIC_API_KEY` stops. Tests: `tests/compile-guard.test.ts`.

### High

**H1. Every story can get the same unrelated second source** — fixed

A second link is used only when another outlet covered the same launch. If there is none, the story has one primary source. Tests: `tests/citations.test.ts`, `tests/cluster.test.ts`.

**H2. Hacker News can hide the official story, and its score almost never helps** — fixed

On a URL clash, the official row wins and keeps HN points. Compile also attaches HN points when titles match. Tests: `tests/ingest-merge.test.ts`, `tests/cluster.test.ts`.

**H3. Approve still works after blocking checks fail** — fixed

Approve reads the latest eval run. Telegram hides Approve when checks failed. Tests: `tests/publish.test.ts`.

**H4. Same event can appear twice, and last week can appear again** — fixed

Stories cluster by canonical URL or title overlap. Published headlines from the last six weeks are skipped. Embeddings are still unused. Tests: `tests/cluster.test.ts`.

**H5. “Wherever it lands” is still an Asia leftover guessed from words** — fixed

Each story stores `place` from the source region. Badges and covers read that field. Company names in the write-up no longer retag a story. `asiaAngle` remains as an unused leftover column. Tests: `tests/place.test.ts`.

**H6. The writer never sees the actual article** — fixed

The prompt now gets URL, date, excerpt, stored place, and an independent second source when one exists. Tests: `tests/citations.test.ts`.

**H7. Paywalled core sources can knock a good story out** — fixed

401/403 from a paywalled citation counts as “the link exists.” 404s and timeouts still fail. Tests: `tests/checks.test.ts`.

**H8. First migrate can fail on Postgres without pgvector**

The init migration runs `CREATE EXTENSION vector` and adds unused 1536-d embedding columns. Railway Postgres without pgvector will fail the one-time migrate, so nothing else can seed.

- Files: `drizzle/migrations/0000_init.sql`, `scripts/migrate.ts`, `README.md`
- Suggested fix: Make pgvector optional, or document the Railway/Neon pgvector plugin as a hard setup step and test migrate against that image.

**H9. Publish mode in the database can ignore the env var**

Seed writes a `settings.publish` row once (`ON CONFLICT DO NOTHING`). Compile reads that row first. Changing `PUBLISH_MODE` or `PUBLISH_KILL_SWITCH` on Railway later may do nothing. The kill switch only ORs with the stored flag.

- Files: `scripts/seed-sources.ts`, `src/lib/pipeline/auto-publish.ts`, `config/publish.ts`
- Suggested fix: Env wins for mode and kill switch. Use the database only if you add a real settings screen.

**H10. Compile is not one database transaction**

Deletes, inserts, eval rows, and status updates are separate writes. A crash mid-run can leave a week with missing stories or mixed old/new rows.

- Files: `src/lib/pipeline/compile.ts`
- Suggested fix: Wrap the replace in one transaction. On failure, keep the previous edition untouched.

### Medium

**M1. Tuesday 08:00 Hong Kong time is computed wrong before 08:00**

`nextTuesdayEightHkt` subtracts 8 from the Hong Kong hour, then sets UTC midnight. When the Hong Kong hour is before 08:00, the date rolls back a day. A Tuesday 07:00 reminder can store Monday 08:00 as `sendAt`.

- Files: `src/lib/pipeline/window.ts`
- Suggested fix: Build “next Tuesday 08:00 Asia/Hong_Kong” with a timezone library, not `hour - 8`.

**M2. Thin weeks, dead sources, and late approvals have no playbook**

If fewer than five stories survive, the edition stays `draft`. There is no short-week path in the CLI, no Telegram alert when a source errors, and no timeout if Fabio does not press a button. Monday 18:00 compile also cuts off Tuesday-morning news.

- Files: `config/pipeline.ts` (`shortEditionMin`, `allowShort`), `src/lib/pipeline/ingest.ts`, `scripts/pipeline.ts` (`remind`)
- Suggested fix: Telegram should say “thin week” or “source X failed.” Remind until Tuesday 08:00. Keep ingest daily so Monday night items are in the database; decide whether compile should run Tuesday 06:00 instead.

**M3. Request changes does not take a note**

The webhook only handles button presses. Chat text is ignored. “Request changes” sets status to `draft` with no comment.

- Files: `src/app/api/telegram/webhook/route.ts`, `src/lib/pipeline/publish.ts`
- Suggested fix: After Request changes, treat the next chat message from Fabio as the note and store it on `approvals`.

**M4. Signup saves emails that never go out**

`/api/subscribe` stores `pending` and stops. There is no confirm step, no provider, no send on publish. The form copy already admits email send is off. Header “Subscribe” jumps to `#subscribe`, which is missing on story pages and the empty homepage (footer form has no that id).

- Files: `src/app/api/subscribe/route.ts`, `src/components/newsletter-signup.tsx`, `src/components/site-header.tsx`, `src/app/page.tsx`
- Suggested fix: Either hide Subscribe until a provider is wired, or add a simple transactional sender and confirm link. Put `#subscribe` in the footer form.

**M5. Ingest counts and source health are misleading**

`stored` goes up even when the URL already exists. A source is marked OK after a fetch even if every item was skipped. There are no retries. RSS and Hugging Face do not filter by the 7-day window at fetch time (compile drops undated items later).

- Files: `src/lib/pipeline/ingest.ts`, `src/lib/pipeline/sources/rss.ts`, `src/lib/pipeline/sources/huggingface.ts`
- Suggested fix: Count inserts vs conflicts. Retry a failed feed once. Filter `publishedAt` at ingest. Alert when `lastError` is set on a core source.

**M6. Admin HTTP compile used to send “ok” instead of headlines**

Fixed in this PR. The admin route was mapping style-check details (`ok`) into the Telegram list. The CLI already used real headlines.

- Files: `src/app/api/admin/run/route.ts`, `src/lib/pipeline/compile.ts`
- Suggested fix: Done here (`result.headlines`). Still send Telegram on failed compiles so Fabio sees the failure.

**M7. Reader site leftovers and weak metadata**

Footer “Powered by Anthropic” and a Follow link to anthropic.com tell readers how the site is built (the About page must not). Follow → `https://x.com` has no handle. Theme types still include Web3 / Fintech / Energy. `posts_archive` and `/post` redirects are Edge Daily leftovers. No favicon is wired. Layout has no Open Graph image. `html lang` is `en`, not `en-HK`. Dark mode waits for a client effect, so the first paint can flash. RSS titles are not escaped.

- Files: `src/components/site-footer.tsx`, `src/lib/story-meta.ts`, `src/components/cover-art.tsx`, `src/lib/db/schema.ts`, `src/app/layout.tsx`, `src/components/theme-toggle.tsx`, `src/app/feed.xml/route.ts`, `public/vite.svg`
- Suggested fix: Footer follow links should be RSS and Fabio’s real X handle only. Drop stack credits from the public footer. Always theme AI. Add a Meridian favicon and a default OG image. Set `lang="en-HK"`. Apply stored theme before paint.

**M8. Homepage latest edition loads every published week**

`getLatestPublishedEdition` hydrates the full archive. Fine at Week 1; wasteful later. All pages are `force-dynamic` with no cache, which is correct until you add a host cache, but every visit hits Postgres.

- Files: `src/lib/queries/editions.ts`, `src/app/layout.tsx`
- Suggested fix: Query the latest published row only. Keep dynamic rendering until you add a short cache after publish.

**M9. Railway cron file would start the website**

`railway.cron.json` uses the same start command as the web service and does not set `PROCESS_ROLE=pipeline`. `tsx` is a devDependency; the Docker image works only because it copies the full `node_modules`. Health does not check the database. Migrate/seed are not part of deploy.

- Files: `railway.cron.json`, `scripts/start.mjs`, `package.json`, `Dockerfile`, `src/app/api/health/route.ts`
- Suggested fix: Cron start command must be `PROCESS_ROLE=pipeline PIPELINE_JOB=… node scripts/start.mjs`. Health should ping Postgres. Run migrate as a one-off, not on every web boot.

**M10. Tests cover helpers, not the weekly run**

Unit tests for rank, checks, week numbers, auth fail-closed, and auto-publish thresholds are real and useful. Nothing runs ingest → compile → approve against a file database. Mastra’s workflow is a thin wrapper and is not what Railway cron runs.

- Files: `tests/*.ts`, `src/mastra/workflows/weekly-edition.ts`, `scripts/pipeline.ts`
- Suggested fix: One integration test: seed two sources, compile `--mock`, assert week `1`, five stories, distinct citations, status `in_review`.

### Low

**L1. Leftover Edge names** (partly fixed here)

`package.json` was `edge-weekly`. Health reported `edge-weekly`. Local file DB defaulted to `.data/edge-weekly`. Example `DATABASE_URL` used `edge_weekly`. README still explains the Edge Daily rebuild (fine for operators). Dead tables: `posts_archive`, `x_accounts`, `x_queries`. Unused npm package `cn`. Unused `public/vite.svg`.

- Files: `package.json`, `src/app/api/health/route.ts`, `src/lib/db/index.ts`, `.env.example`, `src/lib/db/schema.ts`
- Suggested fix: Names in this PR. Leave schema drops for a later migration.

**L2. Auto-publish is built, and should stay off**

Thresholds (8 prior editions, 7 passing, 1 edit max, last 3 clean) and the kill switch behave as tested. Fabio still wants to approve each edition. Auto would skip Telegram once those bars are met.

- Files: `config/publish.ts`, `src/lib/pipeline/auto-publish.ts`, `tests/auto-publish.test.ts`
- Suggested fix: Keep `PUBLISH_MODE=manual` until a written decision to change it.

**L3. Preview links never expire**

Preview tokens are long random values and are blocked from robots. Anyone with the Telegram link can read the draft. That is acceptable for a one-person approve flow.

- Files: `src/lib/ids.ts`, `src/app/preview/[token]/page.tsx`, `src/app/robots.ts`
- Suggested fix: Optional expiry after publish or after 14 days.

**L4. Small a11y and mobile gaps**

No skip-to-content link. “In this edition” rail is desktop-only (story pages still work on a phone). Cover art is `aria-hidden`, which is correct. Signup and empty/error states are clear.

- Files: `src/app/layout.tsx`, `src/app/editions/[week]/[slug]/page.tsx`
- Suggested fix: Add a skip link. Optionally show a compact “This edition” list on small screens.

## Improvement opportunities

Ranked by impact for a first real edition versus effort.

| Rank | Opportunity | Impact | Effort | Why |
| --- | --- | --- | --- | --- |
| 1 | Guard re-runs and require a real Anthropic key | High | Low | Done |
| 2 | Cluster stories and attach HN as signal | High | Medium | Done |
| 3 | Real citations + excerpts in the writer | High | Medium | Done |
| 4 | Store place on the story | High | Medium | Done |
| 5 | Paywall-aware link check + source failure Telegram | High | Low | Paywall 401/403 done. Telegram still does not alert when a source feed dies |
| 6 | Approve only after checks pass | High | Low | Done |
| 7 | One compile transaction; env wins for publish mode | Medium | Low | Safer ops on Railway |
| 8 | Wire one email provider or hide Subscribe | Medium | Medium | Signup is honest only if mail exists |
| 9 | Compile Tuesday 06:00 HKT, remind until 08:00 | Medium | Low | Fewer missed Monday-night stories |
| 10 | Drop unused Mastra/X/archive/embeddings until needed | Low | Low | Less cost and less confusion |
| 11 | Homepage query + favicon + OG image + footer cleanup | Medium | Low | Reader polish without touching the engine |
| 12 | One end-to-end compile test | Medium | Low | Locks the weekly shape before more prompt work |

Do not spend time on X ingest, embeddings, or auto-publish tuning before Week 1 has shipped by hand.

## Recommended order of work

1. **Finish Railway setup** (no code): Postgres with pgvector or a migrate that does not need it, env vars, migrate (now includes `place`), seed sources, Telegram webhook, Anthropic key, ingest cron, compile cron. Confirm `/api/health` and a `--mock` compile in that database.
2. **Still open:** env kill switch vs database settings (H9), compile as one transaction (H10), source-failure Telegram (rest of opportunity 5).
3. **Reader polish** (M4, M7, L4): footer, favicon, Subscribe honesty, skip link.
4. **Only then** consider email send, Tuesday compile time, and (much later) auto-publish.

## Cost

Per edition today, if the Anthropic key is set and X stays off:

- **Writing:** 5–7 Sonnet calls, about 400–700 input tokens and a few hundred output tokens each. Roughly well under a dollar a week at current Sonnet prices. This is the only real model cost.
- **Ranking and checks:** Configured (`MODEL_RANKING`, `MODEL_CHECKS`) but unused. Heuristics and rules only. Keep it that way.
- **Embeddings:** Schema + OpenAI default id, never called. No cost unless you turn them on.
- **X:** Off. If `FEATURE_X_SOURCES=true`, ingest throws and that source fails. Do not turn it on; X charges per read and the client is not wired.
- **Everything else:** RSS, Hugging Face, and HN Algolia are free. Link checks are 10–14 GETs.

Ways to keep it low:

- Leave X off.
- Do not add an LLM ranker or embeddings for novelty.
- Do not re-compile a published week (also a correctness fix).
- One writer call with all stories is optional later; seven Sonnet calls is already cheap.
- Cron service should not need a full Next build beyond the shared image.

## Railway readiness (first real edition)

Still missing, as the owner said: Railway project, Postgres, Telegram bot, Anthropic key, crons, webhook.

Set on **web** and **cron**:

`DATABASE_URL`, `SITE_URL`, `ADMIN_API_KEY`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `PUBLISH_MODE=manual`, `PUBLISH_KILL_SWITCH=false`.

Web: `PROCESS_ROLE=web`.  
Ingest cron: `PROCESS_ROLE=pipeline`, `PIPELINE_JOB=ingest`, `30 21 * * *` (05:30 HKT).  
Compile cron: `PROCESS_ROLE=pipeline`, `PIPELINE_JOB=compile`, `0 10 * * 1` (Monday 18:00 HKT).  
Optional remind: `PIPELINE_JOB=remind`, `0 23 * * 1` (Tuesday 07:00 HKT).

Then, once: `npm run db:migrate`, `npm run db:seed-sources`, set Telegram webhook. Do not set `ALLOW_PGLITE` on Railway. Do not set `FEATURE_X_SOURCES=true`. Confirm pgvector before migrate.

Build/start: `package.json` `build` / `start` are fine. Docker builds Next, then `scripts/start.mjs` either serves the site or runs the CLI.

## Product logic versus intent

| Intent | In the code today |
| --- | --- |
| Weekly, 5–7 stories, Tuesday 08:00 Hong Kong | Compile is Monday 18:00; send time is stored, not sent; email send does not exist |
| Starts at Week 1, no Edge archive | Week numbers start at 1; old `/post` URLs go to `/archive`; `posts_archive` table still exists unused |
| Short hand-picked list (~11) plus HN as signal | `data/sources.csv` matches that list; HN now attaches to the official story |
| Stronger editorial voice | Prompt gets excerpt, URL, date, and a real second source when one exists |
| Localised by place | Stored `place` from the source region; covers and badges read that field |
| Generated SVG covers, deterministic | Yes, from seed + stored place; leftover Web3/Fintech/Energy icons remain |
| Magazine UI | Featured lead, card grid, sticky Subscribe, signup band, story rail: present |
| About never explains the stack | About page is clean; footer still says “Powered by Anthropic” |
| Fabio approves on Telegram; auto is a later kill-switched path | Approve requires a passing eval; failed checks hide the Approve button |
| Portable to Vercel | Pages read Postgres; no Vercel-only APIs. Cron must stay off the web process |

## Changes in this PR

- Leftover `edge-weekly` names renamed to `meridian`.
- Admin compile Telegram list uses real headlines.
- Live weeks cannot be overwritten without `--force`; real compiles require `ANTHROPIC_API_KEY`.
- Hacker News is a signal on the official story; the same launch is one clustered story.
- Writer gets excerpts and only a genuine second outlet.
- Each story stores `place`; badges and covers no longer guess from keywords.
- Paywalled 401/403 no longer fail a story; Approve cannot skip a failed check.
