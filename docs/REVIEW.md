---
title: Meridian product and codebase review
date: 2026-10-10
---

# Meridian product and codebase review

## Summary

The site and weekly pipeline are far enough along to demo, but they are not ready to ship a real Tuesday edition.

The reader-facing magazine layout, About page, Week 1 numbering, SVG covers, and Telegram approve flow match the product intent. The weekly engine underneath does not. Selection is “highest source weight,” not an editorial pick. Place tags are guessed from keywords. A second source is often an unrelated leftover item. Hacker News can hide an official story. Re-running compile can take a live edition offline. If the Anthropic key is missing, the pipeline silently writes mock copy.

Railway, Postgres, Telegram, the Anthropic key, and crons are still unset. Do not turn on `PUBLISH_MODE=auto` until Fabio has approved several real weeks by hand.

This PR only changes leftover `edge-weekly` names and one broken Telegram headline line. Bigger fixes are listed below, not done.

## Issues

### Critical

**C1. Re-running the weekly compile can take a live edition offline**

`compileEdition` reuses the same Week number when it runs again in the same Hong Kong ISO week. It then overwrites status. In the default manual mode a passing re-run sets the edition back to `in_review` and clears the publish time. A failed re-run sets it to `draft`. The public homepage would go empty.

- Files: `src/lib/pipeline/compile.ts` (existing-week lookup, `onConflictDoUpdate`), `src/lib/pipeline/auto-publish.ts`, `src/lib/pipeline/week.ts`
- Suggested fix: If that week is already `published` or `in_review`, refuse to overwrite unless Fabio passes an explicit `--force` (or a “replace draft only” flag). Never clear `publishedAt` on a live week.

**C2. A missing Anthropic key writes fake copy as if it were real**

If `ANTHROPIC_API_KEY` is unset, both the CLI and the writer fall back to mock stories. Railway cron would still save an edition and can still send Telegram. Fabio could approve generic filler with real-looking source links.

- Files: `scripts/pipeline.ts` (mock default), `src/lib/pipeline/write.ts` (`!process.env.ANTHROPIC_API_KEY`)
- Suggested fix: Mock only when `--mock` / `--dry-run` is set. In production, stop compile if the key is missing.

### High

**H1. Every story can get the same unrelated second source**

After writing, compile attaches citations by taking the picked item plus the first other non-signal item in the whole week. Almost every story then cites the same leftover article. The “two sources” check still passes.

- Files: `src/lib/pipeline/compile.ts` (`storiesWithRealLinks`), `src/lib/pipeline/write.ts`
- Suggested fix: Pair a story only with coverage of the same event (same URL family, shared title tokens, or a stored cluster). If there is no second source, say so. Do not invent a roommate.

**H2. Hacker News can hide the official story, and its score almost never helps**

Ingest stores items by canonical URL and keeps the first one. If HN sees a launch before the lab RSS, the official item is skipped and the HN row is marked “signal only,” so selection drops it. HN points also never copy onto the matching lab story, so the “HN can raise a score” rule barely runs.

- Files: `src/lib/pipeline/ingest.ts` (`onConflictDoNothing`), `src/lib/pipeline/sources/hackernews.ts`, `src/lib/pipeline/rank.ts`
- Suggested fix: Prefer a non-signal row on conflict. Store HN as a signal attached to the article URL, not as the article itself.

**H3. Approve still works after blocking checks fail**

Failed checks save the edition as `draft`. Telegram still shows Approve. `applyEditionAction` allows `draft` and `in_review`. The message says not to approve, but the button publishes anyway.

- Files: `src/lib/pipeline/publish.ts`, `src/app/api/telegram/webhook/route.ts`, `src/lib/pipeline/telegram.ts`
- Suggested fix: Approve only when the latest eval run passed, or disable the Approve button when checks failed.

**H4. Same event can appear twice, and last week can appear again**

There is no cluster of “this is the same launch.” `noveltyWeeks: 6` is configured and unused. Embeddings exist on the schema and are never written. `pickTopStories` just takes the next highest weights.

- Files: `src/lib/pipeline/rank.ts`, `src/lib/pipeline/dedupe.ts`, `config/pipeline.ts`, `src/lib/db/schema.ts`
- Suggested fix: Cluster by canonical URL and a simple title match before picking. Skip stories that ran in the last six weeks.

**H5. “Wherever it lands” is still an Asia leftover guessed from words**

The product wants a place badge, a cover palette, and “why it matters here.” The pipeline still stores `isAsia` / `asiaAngle`. The reader site then guesses country from words in the finished text. A US lab story can be tagged China because the write-up mentions DeepSeek. Place is not a first-class field Fabio can correct.

- Files: `src/lib/pipeline/write.ts`, `src/lib/story-meta.ts`, `src/lib/story-view.ts`, `src/lib/db/schema.ts`, `src/app/editions/[week]/[slug]/page.tsx`
- Suggested fix: Store `place` on each story (country or region, or Global). Drive the badge, palette, and “why it matters here” from that field. Keep `asiaAngle` only as a migration leftover until you drop it.

**H6. The writer never sees the actual article**

The live prompt gets a title, a source region, and three other titles. No excerpt, no URL, no body. That produces thin voice and made-up links (later overwritten). Ranking is source weight plus freshness, not “does this change a plan.”

- Files: `src/lib/pipeline/write.ts`, `src/lib/pipeline/rank.ts`, `src/lib/pipeline/sources/rss.ts`
- Suggested fix: Pass the primary URL, date, and excerpt into the prompt. Ask for a take, then a fact check against those excerpts only.

**H7. Paywalled core sources can knock a good story out**

SCMP and Tech in Asia are on the hand-picked list and marked partial paywall. The blocking link check does a live GET. A 403/401 drops the whole story, which can leave a thin week.

- Files: `src/lib/pipeline/checks.ts` (`checkLinksResolve`), `data/sources.csv`
- Suggested fix: Treat 401/403 from a known paywall source as “link exists.” Fail only on timeouts and hard 404s.

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
| 1 | Guard re-runs and require a real Anthropic key | High | Low | Stops the two ways to ship or unpublish by accident |
| 2 | Cluster stories and attach HN as signal | High | Medium | Stops dupes and silent drops of lab posts |
| 3 | Real citations + excerpts in the writer | High | Medium | Voice and “two sources” become true |
| 4 | Store place on the story | High | Medium | Badge, cover, and “why it matters here” stay consistent |
| 5 | Paywall-aware link check + source failure Telegram | High | Low | SCMP/TIA weeks stop collapsing |
| 6 | Approve only after checks pass | High | Low | Telegram cannot override a failed gate by habit |
| 7 | One compile transaction; env wins for publish mode | Medium | Low | Safer ops on Railway |
| 8 | Wire one email provider or hide Subscribe | Medium | Medium | Signup is honest only if mail exists |
| 9 | Compile Tuesday 06:00 HKT, remind until 08:00 | Medium | Low | Fewer missed Monday-night stories |
| 10 | Drop unused Mastra/X/archive/embeddings until needed | Low | Low | Less cost and less confusion |
| 11 | Homepage query + favicon + OG image + footer cleanup | Medium | Low | Reader polish without touching the engine |
| 12 | One end-to-end compile test | Medium | Low | Locks the weekly shape before more prompt work |

Do not spend time on X ingest, embeddings, or auto-publish tuning before Week 1 has shipped by hand.

## Recommended order of work

1. **Finish Railway setup** (no code): Postgres with pgvector or a migrate that does not need it, env vars, migrate, seed sources, Telegram webhook, Anthropic key, ingest cron, compile cron. Confirm `/api/health` and a `--mock` compile in that database.
2. **Lock the dangerous edges** (C1, C2, H3, H9): no silent mock, no overwrite of a live week, no approve on failed checks, env kill switch actually works.
3. **Make selection honest** (H1, H2, H4, H7): citations, HN, clustering, paywall links.
4. **Make place and voice real** (H5, H6): stored place, excerpts in the prompt, Fabio edits if needed.
5. **Reader polish** (M4, M7, L4): footer, favicon, Subscribe honesty, skip link.
6. **Only then** consider email send, Tuesday compile time, and (much later) auto-publish.

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
| Short hand-picked list (~11) plus HN as signal | `data/sources.csv` matches that list; HN is signal-only in ranking, but ingest/citation bugs undermine it |
| Stronger editorial voice | Prompt asks for a take; mock copy is generic; live writer has no article text |
| Localised by place | Keyword guess + leftover Asia fields |
| Generated SVG covers, deterministic | Yes, from seed + guessed region; leftover Web3/Fintech/Energy icons |
| Magazine UI | Featured lead, card grid, sticky Subscribe, signup band, story rail: present |
| About never explains the stack | About page is clean; footer still says “Powered by Anthropic” |
| Fabio approves on Telegram; auto is a later kill-switched path | Buttons exist; auto thresholds exist; several safety holes above |
| Portable to Vercel | Pages read Postgres; no Vercel-only APIs. Cron must stay off the web process |

## Small fixes in this PR

- Renamed package and health service from `edge-weekly` to `meridian`.
- Local file-database default and `.env.example` now use `meridian` instead of `edge-weekly` / `edge_weekly`.
- Admin compile Telegram list now uses real headlines, not the style-check string `ok`.

No other behaviour was changed on purpose. Tests and production build should still pass.
