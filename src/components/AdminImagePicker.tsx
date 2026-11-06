import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Link2,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface PresetImageOption {
  label: string;
  url: string;
}

interface AdminImagePickerProps {
  label: string;
  stepNumber?: number;
  value: string;
  defaultValue: string;
  onChange: (newUrl: string) => void;
  presets?: PresetImageOption[];
  badgeColor?: "emerald" | "purple" | "indigo" | "amber";
  hint?: string;
}

/**
 * Optimasi client-side: kompresi gambar besar agar ringan (~35KB), cepat dimuat, dan tahan restart server
 */
async function compressImageFile(file: File, maxWidth = 960, quality = 0.76): Promise<string> {
  return new Promise((resolve, reject) => {
    // Jika file SVG atau GIF, jangan dikompresi canvas
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Prioritaskan WebP atau JPEG
        const mime = file.type === "image/png" ? "image/webp" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AdminImagePicker: React.FC<AdminImagePickerProps> = ({
  label,
  stepNumber,
  value,
  defaultValue,
  onChange,
  presets = [],
  badgeColor = "emerald",
  hint,
}) => {
  const [mode, setMode] = useState<"upload" | "link" | "preset">(() => {
    if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
      return "link";
    }
    if (presets && presets.some((p) => p.url === value)) {
      return "preset";
    }
    return "upload";
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successToast, setSuccessToast] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDefault = value === defaultValue;
  const isUploadUrl = Boolean(value && value.startsWith("/uploads/"));
  const isDataUrl = Boolean(value && value.startsWith("data:image/"));
  const isExternalLink = Boolean(value && (value.startsWith("http://") || value.startsWith("https://")));

  const badgeColorClasses = {
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  }[badgeColor];

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File yang dipilih harus berupa file gambar (JPG, PNG, WebP, GIF, SVG).");
      return;
    }

    // Maksimal batas upload 20MB
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("Ukuran file terlalu besar (Maksimal 20MB).");
      return;
    }

    setErrorMessage("");
    setUploading(true);
    setUploadProgress("Mengoptimasi ukuran gambar...");

    try {
      // 1. Optimasi gambar di client menjadi WebP/JPEG ringan (~35KB)
      const optimizedDataUrl = await compressImageFile(file);
      setUploadProgress("Menyimpan gambar...");

      // 2. Simpan langsung sebagai data URL yang permanen di Cloudflare
      // Ini membuat aplikasi 'Serverless' karena tidak butuh backend untuk simpan file.
      onChange(optimizedDataUrl);
      setSuccessToast("Gambar berhasil disimpan secara permanen!");
      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err: any) {
      console.error("Gagal memproses gambar:", err);
      setErrorMessage(err?.message || "Gagal memproses file gambar.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-neutral-950 border border-neutral-800/90 space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-mono">
            {stepNumber !== undefined && (
              <span
                className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold border ${badgeColorClasses}`}
              >
                {stepNumber}
              </span>
            )}
            <span>{label}</span>
          </label>

          <div className="flex items-center gap-2">
            {!isDefault && (
              <button
                type="button"
                onClick={() => onChange(defaultValue)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800"
                title="Kembalikan ke gambar default sistem"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            )}
          </div>
        </div>

        {hint && <p className="text-[11px] text-neutral-400 leading-relaxed">{hint}</p>}

        {/* Mode Selector Tabs (Upload File vs Link Image vs Preset) */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "upload"
                ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "link"
                ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Link Image</span>
          </button>
          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("preset")}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "preset"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Preset</span>
            </button>
          )}
        </div>

        {/* ── MODE 1: UPLOAD FILE ── */}
        {mode === "upload" && (
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-[hsl(var(--brand-accent))] bg-[hsl(var(--brand-accent)/0.08)]"
                  : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 hover:bg-neutral-900/80"
              }`}
            >
              {uploading ? (
                <div className="py-2 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--brand-accent))]" />
                  <span className="text-xs font-mono text-neutral-300">{uploadProgress}</span>
                </div>
              ) : (
                <div className="py-1 flex flex-col items-center justify-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs font-semibold text-neutral-200">
                    Klik untuk pilih gambar atau seret file ke sini
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Mendukung JPG, PNG, WebP, GIF, SVG (Maks. 20MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODE 2: INPUT LINK URL / LINK IMAGE ── */}
        {mode === "link" && (
          <div className="space-y-1.5">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://contoh.com/gambar.jpg"
                  className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl pl-3 pr-8 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                />
                {value && (
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs font-mono"
                    title="Kosongkan"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      onChange(text.trim());
                      setSuccessToast("Link berhasil ditempel!");
                      setTimeout(() => setSuccessToast(""), 3000);
                    }
                  } catch {
                    // Clipboard access might require permission
                  }
                }}
                className="h-10 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                title="Tempel link dari clipboard"
              >
                <span>Tempel Link</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Tempel link langsung ke file gambar (URL berakhiran .jpg, .png, .webp, atau direct image link).
            </p>
          </div>
        )}

        {/* ── MODE 3: PRESET PILIHAN ── */}
        {mode === "preset" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, idx) => {
                const isSelected = value === preset.url;
                return (
                  <button
                    key={`preset-${idx}`}
                    type="button"
                    onClick={() => onChange(preset.url)}
                    className={`p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-neutral-800 border-white text-white shadow-sm"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                    }`}
                  >
                    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-black/60 relative">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold truncate leading-tight">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* ── THUMBNAIL PREVIEW & STATUS ── */}
      <div className="space-y-2 pt-2 border-t border-neutral-900">
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
            <span>Live Preview</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
            {isUploadUrl
              ? "File Terupload"
              : isDataUrl
              ? "Base64 Gambar"
              : isExternalLink
              ? "Link Web"
              : "Preset Sistem"}
          </span>
        </div>

        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 relative group shadow-sm">
          <img
            src={value || defaultValue}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultValue;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
            <span className="text-[10px] font-mono text-white/90">Aspect Ratio 16:9</span>
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded bg-black/60 hover:bg-black text-white text-[10px] font-mono flex items-center gap-1"
                title="Buka gambar di tab baru"
              >
                <span>Buka</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
