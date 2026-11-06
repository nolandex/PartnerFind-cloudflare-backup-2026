PRAGMA foreign_keys = ON;

-- Satu-satunya tabel yang dipakai: pengaturan konten landing page
-- (website_content, announcement_bar/countdown, hero_counter, cta_config, video_config).
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  updated_at INTEGER NOT NULL
);
