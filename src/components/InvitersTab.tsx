import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/cloudflareApi';

// Tab admin "Testimoni Pengundang": admin mencatat kejadian pengundang
// yang BENAR-BENAR terjadi — pengundang bergabung, penarikan imbalan yang
// sudah dibayar, dan review dari pengundang asli. Setiap catatan tampil
// di halaman /referral dan otomatis terkirim ke channel Telegram.

type InvEvent = {
  id: number;
  type: string;
  name: string;
  amount: number | null;
  text: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  join: 'Bergabung',
  withdraw: 'Tarik Dana',
  review_short: 'Review Singkat',
  review_medium: 'Review Sedang',
  review_long: 'Review Panjang',
};

const REVIEW_CAP: Record<string, number> = {
  review_short: 200,
  review_medium: 500,
  review_long: 1200,
};

export default function InvitersTab() {
  const [events, setEvents] = useState<InvEvent[]>([]);
  const [type, setType] = useState('join');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [importText, setImportText] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const [importNote, setImportNote] = useState('');

  const isReview = type.startsWith('review');

  const load = async () => {
    try {
      const res = await apiRequest<{ data: InvEvent[] }>('/api/admin/inviter-events');
      setEvents(res.data || []);
    } catch {
      setNote('Gagal memuat daftar. Coba lagi.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    setNote('');
    if (!name.trim()) return setNote('Nama pengundang wajib diisi.');
    if (type === 'withdraw' && (!amount || Number(amount) <= 0))
      return setNote('Nominal penarikan wajib diisi dan lebih dari 0.');
    if (isReview && !text.trim()) return setNote('Isi review wajib diisi.');
    setBusy(true);
    try {
      await apiRequest('/api/admin/inviter-events', {
        method: 'POST',
        body: {
          type,
          name: name.trim(),
          amount: type === 'withdraw' ? Number(amount) : undefined,
          text: isReview ? text.trim() : undefined,
        },
      });
      setNote('Tersimpan — sudah tampil di /referral dan terkirim ke channel Telegram.');
      setName('');
      setAmount('');
      setText('');
      await load();
    } catch (e: any) {
      setNote(e?.message || 'Gagal menyimpan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const JENIS_MAP: Record<string, string> = {
    gabung: 'join',
    join: 'join',
    tarik: 'withdraw',
    'tarik-dana': 'withdraw',
    withdraw: 'withdraw',
    'review-singkat': 'review_short',
    review_short: 'review_short',
    'review-sedang': 'review_medium',
    review_medium: 'review_medium',
    'review-panjang': 'review_long',
    review_long: 'review_long',
  };

  const submitImport = async () => {
    setImportNote('');
    const items: { type: string; name: string; amount?: number; text?: string }[] = [];
    for (const line of importText.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const sep = t.includes('\t') ? '\t' : t.includes(';') ? ';' : t.includes('|') ? '|' : ',';
      const parts = t.split(sep).map((x) => x.trim());
      const type = JENIS_MAP[(parts[0] || '').toLowerCase()];
      const name = parts[1] || '';
      if (!type || !name) continue;
      const item: { type: string; name: string; amount?: number; text?: string } = { type, name };
      if (type === 'withdraw') item.amount = Number((parts[2] || '').replace(/[^0-9]/g, ''));
      if (type.startsWith('review')) item.text = parts.slice(3).join(sep) || parts[2] || '';
      items.push(item);
    }
    if (items.length === 0)
      return setImportNote('Tidak ada baris yang terbaca. Periksa formatnya: Jenis, Nama, Nominal, Teks.');
    setImportBusy(true);
    try {
      const res: any = await apiRequest('/api/admin/inviter-events/import', {
        method: 'POST',
        body: { items },
      });
      setImportNote(
        `Selesai — ${res.inserted ?? 0} catatan masuk dan tampil di website (+1 ringkasan ke channel), ${res.skipped ?? 0} baris dilewati (format/nominal tidak valid).`,
      );
      setImportText('');
      await load();
    } catch (e: any) {
      setImportNote(e?.message || 'Impor gagal. Coba lagi.');
    } finally {
      setImportBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Hapus catatan ini dari website? (Yang sudah terkirim ke channel tidak ikut terhapus.)')) return;
    try {
      await apiRequest(`/api/admin/inviter-events/${id}`, { method: 'DELETE' });
      await load();
    } catch {
      setNote('Gagal menghapus. Coba lagi.');
    }
  };

  const inputCls =
    'w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-rose-400/60';

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-rose-400/30 bg-rose-400/5 p-4 text-sm leading-relaxed text-rose-100/90">
        Hanya catat kejadian yang <strong>benar-benar terjadi</strong>: pengundang yang sungguh
        bergabung, penarikan yang sungguh sudah dibayar, dan review dari pengundang asli.
        Nama boleh disensor sebagian (mis. <em>Rahm***</em>). Setiap catatan otomatis tampil di
        halaman /referral dan terkirim ke channel Telegram PartnerFind.
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">
            Jenis
          </label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            <option value="join">Pengundang bergabung</option>
            <option value="withdraw">Tarik dana (imbalan cair)</option>
            <option value="review_short">Review singkat (maks 200 karakter)</option>
            <option value="review_medium">Review sedang (maks 500 karakter)</option>
            <option value="review_long">Review panjang (maks 1200 karakter)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">
            Nama pengundang
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Mis. Rahm***"
            className={inputCls}
          />
        </div>
        {type === 'withdraw' && (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">
              Nominal penarikan (Rp)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="Mis. 150000"
              className={inputCls}
            />
          </div>
        )}
        {isReview && (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">
              Isi review (kata pengundang sendiri)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={REVIEW_CAP[type]}
              rows={type === 'review_long' ? 6 : 3}
              placeholder="Tulis review persis seperti yang disampaikan pengundang…"
              className={inputCls}
            />
            <p className="mt-1 text-right text-xs text-neutral-500">
              {text.length}/{REVIEW_CAP[type]}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="inline-flex h-11 items-center rounded-xl bg-rose-500 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Menyimpan…' : 'Simpan & Tampilkan'}
        </button>
        {note && <p className="text-sm text-neutral-300">{note}</p>}
      </div>

      <div className="space-y-3 border-t border-neutral-900 pt-8">
        <h3 className="text-sm font-bold text-white">Impor Massal</h3>
        <p className="text-sm leading-relaxed text-neutral-400">
          Untuk mencatat banyak kejadian asli sekaligus (mis. dicatat dulu seharian, dimasukkan
          malamnya). Tempel baris dari Excel atau ketik langsung — satu kejadian per baris, format:{' '}
          <span className="text-neutral-200">Jenis, Nama, Nominal, Teks</span>. Jenis:{' '}
          <span className="text-neutral-200">gabung / tarik / review-singkat / review-sedang / review-panjang</span>.
          Nominal hanya untuk tarik; Teks hanya untuk review. Contoh:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 text-xs leading-relaxed text-neutral-300">{'gabung, Sari***\ntarik, Rahm***, 150000\nreview-singkat, Budi***, , Gampang, tinggal buat grup dan bagikan.'}</pre>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={6}
          placeholder="Tempel baris-baris catatan di sini…"
          className={inputCls}
        />
        <button
          type="button"
          onClick={submitImport}
          disabled={importBusy}
          className="inline-flex h-11 items-center rounded-xl bg-neutral-800 px-6 text-sm font-bold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 cursor-pointer"
        >
          {importBusy ? 'Mengimpor…' : 'Impor Sekarang'}
        </button>
        {importNote && <p className="text-sm text-neutral-300">{importNote}</p>}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-white">
          Catatan yang sudah tampil ({events.length})
        </h3>
        {events.length === 0 ? (
          <p className="text-sm leading-relaxed text-neutral-400">
            Belum ada catatan. Halaman /referral dan channel akan mulai terisi begitu
            kejadian pengundang pertama dicatat di sini.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-900 bg-neutral-950 p-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    {TYPE_LABEL[ev.type] || ev.type}
                    <span className="ml-2 font-normal normal-case tracking-normal text-neutral-500">
                      {ev.created_at}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-200">
                    {ev.type === 'join' && (
                      <>
                        <strong>{ev.name}</strong> bergabung sebagai pengundang.
                      </>
                    )}
                    {ev.type === 'withdraw' && (
                      <>
                        <strong>{ev.name}</strong> menarik imbalan sebesar{' '}
                        <strong>Rp{(ev.amount || 0).toLocaleString('id-ID')}</strong>.
                      </>
                    )}
                    {ev.type.startsWith('review') && (
                      <>
                        “{ev.text}” <span className="text-neutral-400">— {ev.name}</span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(ev.id)}
                  className="shrink-0 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-400 transition-colors hover:border-red-400/50 hover:text-red-300 cursor-pointer"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
