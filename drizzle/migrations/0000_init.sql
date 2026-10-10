CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  url text,
  feed_url text,
  type text NOT NULL,
  region text NOT NULL,
  tier text NOT NULL,
  weight integer NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'paused',
  paywall text,
  notes text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_ok_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id text PRIMARY KEY,
  source_id text NOT NULL REFERENCES sources(id),
  url text NOT NULL,
  canonical_url text NOT NULL UNIQUE,
  title text NOT NULL,
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  excerpt text,
  body_text text,
  is_paywalled boolean NOT NULL DEFAULT false,
  is_signal boolean NOT NULL DEFAULT false,
  lang text,
  hn_points integer,
  embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS items_published_at_idx ON items (published_at DESC);
CREATE INDEX IF NOT EXISTS items_source_id_idx ON items (source_id);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id text PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  is_ai boolean,
  topic text,
  region text,
  story_type text,
  classifier_model text
);

CREATE TABLE IF NOT EXISTS stories (
  id text PRIMARY KEY,
  title text NOT NULL,
  summary text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  embedding vector(1536),
  status text NOT NULL DEFAULT 'candidate',
  drop_reason text
);

CREATE TABLE IF NOT EXISTS story_items (
  story_id text NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'supporting',
  PRIMARY KEY (story_id, item_id)
);

CREATE TABLE IF NOT EXISTS editions (
  id text PRIMARY KEY,
  edition_week text NOT NULL UNIQUE,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  send_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  mode_used text NOT NULL DEFAULT 'manual',
  preview_token text NOT NULL UNIQUE,
  lede jsonb,
  try_this jsonb,
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  sent_at timestamptz,
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS edition_stories (
  id text PRIMARY KEY,
  edition_id text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  story_id text REFERENCES stories(id),
  position integer NOT NULL,
  section text NOT NULL DEFAULT 'main',
  is_asia boolean NOT NULL DEFAULT false,
  place text NOT NULL DEFAULT 'Global',
  slug text NOT NULL,
  headline text NOT NULL,
  body text NOT NULL,
  why_it_matters text NOT NULL,
  asia_angle text,
  UNIQUE (edition_id, slug)
);

CREATE TABLE IF NOT EXISTS citations (
  id text PRIMARY KEY,
  edition_story_id text NOT NULL REFERENCES edition_stories(id) ON DELETE CASCADE,
  sentence_index integer NOT NULL DEFAULT 0,
  item_id text REFERENCES items(id),
  title text NOT NULL,
  url text NOT NULL,
  quote_or_evidence text,
  is_primary boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS eval_runs (
  id text PRIMARY KEY,
  edition_id text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  stage text NOT NULL,
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  passed boolean NOT NULL,
  score_total numeric
);

CREATE TABLE IF NOT EXISTS eval_results (
  id text PRIMARY KEY,
  eval_run_id text NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
  check_name text NOT NULL,
  blocking boolean NOT NULL,
  passed boolean NOT NULL,
  score numeric,
  detail text
);

CREATE TABLE IF NOT EXISTS approvals (
  id text PRIMARY KEY,
  edition_id text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  channel text NOT NULL,
  action text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS edits (
  id text PRIMARY KEY,
  edition_id text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  edition_story_id text,
  before text,
  after text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  confirmed_at timestamptz,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sends (
  id text PRIMARY KEY,
  edition_id text NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  channel text NOT NULL,
  provider_id text,
  sent_count integer NOT NULL DEFAULT 0,
  opens integer,
  clicks integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS posts_archive (
  id text PRIMARY KEY,
  legacy_id integer,
  legacy_slug text NOT NULL UNIQUE,
  theme text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  date date NOT NULL,
  created_at timestamptz
);

CREATE TABLE IF NOT EXISTS x_accounts (
  handle text PRIMARY KEY,
  display_name text NOT NULL,
  account_type text,
  region text,
  tier text NOT NULL,
  status text NOT NULL DEFAULT 'paused',
  notes text
);

CREATE TABLE IF NOT EXISTS x_queries (
  id text PRIMARY KEY,
  query text NOT NULL,
  status text NOT NULL DEFAULT 'paused'
);

INSERT INTO settings (key, value)
VALUES (
  'publish',
  '{"mode":"manual","autoRequires":{"minEditions":8,"windowEditions":8,"minPassing":7,"maxEdited":1,"lastNClean":3},"autoFallbackToReview":true,"killSwitch":false}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
