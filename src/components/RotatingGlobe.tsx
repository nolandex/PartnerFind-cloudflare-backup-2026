import React, { useMemo, memo } from "react";
import { Globe, GLOBE_CONFIG } from "./magicui/globe";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../lib/translations";

/**
 * Converts HSL color string (e.g. "215 100% 50%" or "0 100% 50%")
 * to normalized RGB array [r, g, b] between 0 and 1.
 */
function hslStringToRgb(hslStr?: string): [number, number, number] {
  if (!hslStr) return [0.85, 0.25, 0.25];
  const parts = hslStr.trim().split(/\s+/);
  if (parts.length < 3) return [0.85, 0.25, 0.25];

  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  if (s === 0) return [l, l, l];

  const hue2rgb = (p: number, q: number, t: number) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [
    Math.max(0, Math.min(1, Number(r.toFixed(3)))),
    Math.max(0, Math.min(1, Number(g.toFixed(3)))),
    Math.max(0, Math.min(1, Number(b.toFixed(3)))),
  ];
}

export const RotatingGlobe = memo(function RotatingGlobe() {
  const { locale } = useLanguage();

  // Extract colors matching the active language theme
  const { landColor, rimGlowColor } = useMemo(() => {
    const langConfig = translations[locale] || translations["id-ID"];
    const colorStr = (langConfig as any)?.color || "0 100% 50%";
    const [rawR, rawG, rawB] = hslStringToRgb(colorStr);

    // Landmass color: vivid and luminous
    const lr = Math.max(0.2, Math.min(0.98, rawR * 0.78 + 0.2));
    const lg = Math.max(0.2, Math.min(0.98, rawG * 0.78 + 0.2));
    const lb = Math.max(0.2, Math.min(0.98, rawB * 0.78 + 0.2));

    // COBE Shader atmospheric edge: delicate and soft
    const gr = 0.05 + rawR * 0.22;
    const gg = 0.05 + rawG * 0.22;
    const gb = 0.05 + rawB * 0.22;

    return {
      landColor: [
        Number(lr.toFixed(3)),
        Number(lg.toFixed(3)),
        Number(lb.toFixed(3)),
      ] as [number, number, number],
      rimGlowColor: [
        Number(gr.toFixed(3)),
        Number(gg.toFixed(3)),
        Number(gb.toFixed(3)),
      ] as [number, number, number],
    };
  }, [locale]);

  const globeConfig = useMemo(() => {
    return {
      ...GLOBE_CONFIG,
      baseColor: landColor,
      glowColor: rimGlowColor,
      markerColor: landColor,
      mapSamples: 16000,
      mapBrightness: 5.2,
      diffuse: 1.35,
      dark: 1,
    };
  }, [landColor, rimGlowColor]);

  return (
    <div className="relative w-full flex flex-col items-center justify-start overflow-hidden pointer-events-none select-none">
      <div className="relative w-[152vw] sm:w-[146vw] md:w-[140vw] max-w-[1900px] aspect-[1/0.55] overflow-hidden flex items-start justify-center pointer-events-none shrink-0 -translate-x-[1.5vw] sm:-translate-x-[1.2vw]">
        {/* Atmospheric Ambient Halo */}
        <div
          className="pointer-events-none absolute -top-[3.5%] sm:-top-[4.5%] left-0 w-full aspect-square rounded-full blur-[32px] sm:blur-[46px] opacity-80 transition-all duration-700 z-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 35%, hsl(var(--brand-accent) / 0.7) 41%, hsl(var(--brand-accent) / 0.3) 48%, hsl(var(--brand-accent) / 0.08) 58%, transparent 66%)",
          }}
        />

        {/* Ultra High-Resolution 16,000 Sample 3D Globe */}
        <Globe
          key="globe-dark"
          config={globeConfig}
          className="w-full aspect-square top-0 shrink-0 pointer-events-none z-10"
        />

        {/* Subtle low atmospheric black gradient fade at the very bottom edge of the globe */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-18 bg-gradient-to-t from-black via-black/70 to-transparent z-20" />
      </div>
    </div>
  );
});

export default RotatingGlobe;
