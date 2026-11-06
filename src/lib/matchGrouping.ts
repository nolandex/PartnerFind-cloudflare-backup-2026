// Pengelompokan pasangan cocok per Pemberi (keputusan 2026-10-31).
// Modul murni tanpa dependensi React supaya logikanya bisa diuji terpisah.

export interface MatchLike {
  id: number;
  pencari_id: number;
  pemberi_id: number;
  score?: number | null;
  pencari_name?: string | null;
  pemberi_name?: string | null;
  pemberi_kebutuhan?: string | null;
  pemberi_penawaran?: string | null;
  [key: string]: unknown;
}

export interface PemberiGroup {
  pemberiId: number;
  name: string;
  kebutuhan: string;
  penawaran: string;
  contact: string;
  items: MatchLike[];
  topScore: number;
}

// Kelompokkan matches berdasarkan pemberi_id.
// Urutan kelompok: jumlah Pencari terbanyak dulu, seri dipecahkan oleh kata
// sama tertinggi. Di dalam kelompok: Pencari urut kata sama terbanyak dulu.
export function groupMatchesByPemberi(
  matches: MatchLike[],
  contactOf: (registrantId: number) => string,
  limit = 100,
): PemberiGroup[] {
  const byPemberi = new Map<number, PemberiGroup>();
  for (const m of matches.slice(0, limit)) {
    let g = byPemberi.get(m.pemberi_id);
    if (!g) {
      g = {
        pemberiId: m.pemberi_id,
        name: (m.pemberi_name || '').trim(),
        kebutuhan: m.pemberi_kebutuhan || '',
        penawaran: m.pemberi_penawaran || '',
        contact: contactOf(m.pemberi_id),
        items: [],
        topScore: 0,
      };
      byPemberi.set(m.pemberi_id, g);
    }
    g.items.push(m);
    if ((m.score || 0) > g.topScore) g.topScore = m.score || 0;
  }
  const groups = [...byPemberi.values()];
  for (const g of groups) g.items.sort((a, b) => (b.score || 0) - (a.score || 0));
  groups.sort((a, b) => (b.items.length - a.items.length) || (b.topScore - a.topScore));
  return groups;
}
