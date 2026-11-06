-- Tabel pembatas laju webhook Tally (per IP per menit)
CREATE TABLE IF NOT EXISTS webhook_hits (
  ip TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, window_start)
);
