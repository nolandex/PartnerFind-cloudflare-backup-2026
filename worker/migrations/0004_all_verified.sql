-- Keputusan user 2026-10-31: semua yang mengirim formulir = terverifikasi.
-- Tidak ada lagi status "belum terverifikasi". Kode aplikasi sejak versi ini
-- selalu menyimpan verified=1 untuk pendaftar baru (webhook/manual/import);
-- migration ini menyelaraskan baris lama yang terlanjur tersimpan verified=0
-- (di live: 2 baris dari webhook Tally, peran unknown, dibuat 2026-10-31).
-- Tidak ada baris yang dihapus dan tidak ada kolom yang diubah.
UPDATE registrants SET verified = 1 WHERE verified = 0;
