ALTER TABLE edition_stories ADD COLUMN IF NOT EXISTS place text NOT NULL DEFAULT 'Global';
