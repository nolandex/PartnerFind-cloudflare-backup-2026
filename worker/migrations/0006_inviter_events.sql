-- Testimoni/aktivitas pengundang ASLI (dicatat admin dari kejadian nyata):
-- join = pengundang bergabung, withdraw = penarikan imbalan yang dibayar,
-- review_short/medium/long = review dari pengundang.
CREATE TABLE IF NOT EXISTS inviter_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount INTEGER,
  text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
