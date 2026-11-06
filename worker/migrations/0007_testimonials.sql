-- Testimoni website (landing, di atas CTA): dikelola admin dari panel —
-- foto (data URI), nama, quote, dan keterangan singkat orang yang memberi
-- testimoni. Hanya testimoni asli yang dimasukkan admin.
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quote TEXT NOT NULL,
  photo TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
