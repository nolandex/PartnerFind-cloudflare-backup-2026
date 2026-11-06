# PartnerFind — Landing Page (Cloudflare)

Versi ramping: hanya yang dipakai.

- **Landing page** (`/`) — halaman utama PartnerFind.
- **Halaman setting** (`/admin`, login password admin) — mengatur konten landing page: teks/gambar/video, tombol CTA, dan form Tally.
- **2 angka di hero** — counter anggota dan counter grup (`hero_counter`), naik otomatis sesuai aturan interval yang diatur di halaman setting.
- **Countdown** — countdown pra-registrasi di hero (`announcement_bar`), target tanggal dan pesan diatur di halaman setting.

Backend memakai Cloudflare Workers dan D1 (satu tabel: `settings`), dengan login admin memakai password (hash PBKDF2 tersimpan di D1; sesi cookie bertanda tangan). Embed Tally pada tombol Hero dan CTA tetap berfungsi sebagai formulir eksternal.

Fitur kursus, halaman kursus saya, token premium, profil/direktori, undangan, dan pencocokan sudah dihapus dari paket ini.

Untuk pengembangan lokal, gunakan Node.js 20+, jalankan `npm install`, salin `.dev.vars.example` menjadi `.dev.vars`, lalu jalankan `npm run db:local:migrate` dan `npm run dev`.

Baca [CLOUDFLARE-MIGRATION.md](./CLOUDFLARE-MIGRATION.md) untuk setup Cloudflare, migrasi D1, dan checklist deployment. Migrasi database remote, deployment produksi, serta perubahan DNS tidak dijalankan otomatis.
