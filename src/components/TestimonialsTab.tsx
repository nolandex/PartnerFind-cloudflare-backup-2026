import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/cloudflareApi';

// Tab admin "Testimoni Website": admin mengunggah testimoni untuk section
// testimoni di landing page (di atas CTA) — foto, nama, dan quote.
// Website menampilkan 3 testimoni terbaru.

type Testimonial = {
  id: number;
  name: string;
  quote: string;
  photo: string | null;
  detail: string | null;
  created_at: string;
};

export default function TestimonialsTab() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [detail, setDetail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = async () => {
    try {
      const res = await apiRequest<{ data: Testimonial[] }>('/api/admin/testimonials');
      setItems(res.data || []);
    } catch (e: any) {
      setNote(e?.message || 'Gagal memuat testimoni.');
    }
  };

  useEffect(() => { load(); }, []);

  const handlePhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 480 / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!name.trim() || !quote.trim()) { setNote('Nama dan quote wajib diisi.'); return; }
    setBusy(true);
    try {
      await apiRequest('/api/admin/testimonials', { body: { name: name.trim(), quote: quote.trim(), detail: detail.trim(), photo } });
      setName(''); setQuote(''); setDetail(''); setPhoto(null);
      setNote('Testimoni tersimpan dan tampil di website.');
      await load();
    } catch (e: any) {
      setNote(e?.message || 'Gagal menyimpan testimoni.');
    } finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Hapus testimoni ini dari website?')) return;
    try {
      await apiRequest(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setNote(e?.message || 'Gagal menghapus testimoni.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs leading-relaxed">
        Isi hanya testimoni dari orang asli — foto, nama, dan kata-kata mereka sendiri. Website menampilkan <b>3 testimoni terbaru</b> di section testimoni (di atas CTA).
      </div>

      <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white">Tambah Testimoni</h3>

        <div className="flex items-center gap-4">
          {photo ? (
            <img src={photo} alt="Foto testimoni" className="w-16 h-16 rounded-full object-cover border border-neutral-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-[10px] text-center px-1">Belum ada foto</div>
          )}
          <div className="space-y-2">
            <label className="inline-block px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all">
              Upload Foto
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ''; }} />
            </label>
            {photo && (
              <button type="button" onClick={() => setPhoto(null)} className="block text-[11px] text-red-400 hover:text-red-300 cursor-pointer">Hapus foto</button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1.5">Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Nama pemberi testimoni" className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-400" />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1.5">Quote</label>
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} maxLength={600} rows={3} placeholder="Kata-kata testimoni orang tersebut" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 resize-none" />
          <p className="text-[10px] text-neutral-500 mt-1">{quote.length}/600 karakter</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1.5">Keterangan (opsional)</label>
          <input value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={120} placeholder="Mis. jenis peluang atau kota" className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-400" />
        </div>

        <button type="button" onClick={submit} disabled={busy} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
          {busy ? 'Menyimpan…' : 'Simpan Testimoni'}
        </button>
        {note && <p className="text-xs text-neutral-300">{note}</p>}
      </div>

      <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
        <h3 className="text-sm font-bold text-white">Testimoni Tersimpan ({items.length})</h3>
        {items.length === 0 && <p className="text-xs text-neutral-500">Belum ada testimoni. Section testimoni di website belum tampil.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            {item.photo ? (
              <img src={item.photo} alt={item.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-neutral-800 shrink-0 flex items-center justify-center text-sm font-extrabold text-neutral-300">{item.name.charAt(0)}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{item.name}</div>
              {item.detail && <div className="text-[11px] text-neutral-500">{item.detail}</div>}
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">“{item.quote}”</p>
            </div>
            <button type="button" onClick={() => remove(item.id)} className="text-[11px] font-bold text-red-400 hover:text-red-300 cursor-pointer shrink-0">Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
