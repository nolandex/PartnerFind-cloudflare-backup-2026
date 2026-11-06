-- Sistem pencocokan PartnerFind (SOP Pencocokan)
-- Data pendaftar diteruskan dari webhook Tally / input manual admin / import.
CREATE TABLE IF NOT EXISTS registrants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL DEFAULT 'unknown' CHECK (role IN ('pencari','pemberi','unknown')),
  name TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  bidang TEXT NOT NULL DEFAULT '',
  keahlian TEXT NOT NULL DEFAULT '',
  pengalaman TEXT NOT NULL DEFAULT '',
  jenis TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(jenis)),
  kebutuhan TEXT NOT NULL DEFAULT '',
  penawaran TEXT NOT NULL DEFAULT '',
  verified INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  tally_form_id TEXT,
  tally_submission_id TEXT UNIQUE,
  locale TEXT,
  raw_payload TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_registrants_role ON registrants(role);
CREATE INDEX IF NOT EXISTS idx_registrants_verified ON registrants(verified);
CREATE INDEX IF NOT EXISTS idx_registrants_status ON registrants(status);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pencari_id INTEGER NOT NULL REFERENCES registrants(id) ON DELETE CASCADE,
  pemberi_id INTEGER NOT NULL REFERENCES registrants(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  reasons TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(reasons)),
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','checked','introduced','agreed','closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(pencari_id, pemberi_id)
);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_pencari ON matches(pencari_id);
CREATE INDEX IF NOT EXISTS idx_matches_pemberi ON matches(pemberi_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
