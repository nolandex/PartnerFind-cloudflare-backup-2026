import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGE_OPTIONS } from "../lib/languageOptions";

export function LanguageSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGE_OPTIONS.find((l) => l.locale === locale) || LANGUAGE_OPTIONS[0];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [open]);

  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        {LANGUAGE_OPTIONS.map((lang) => (
          <button
            key={lang.locale}
            onClick={() => {
              if (locale !== lang.locale) {
                setLocale(lang.locale);
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
              locale === lang.locale
                ? "bg-[hsl(var(--brand-accent))/0.15] text-[hsl(var(--brand-accent))]"
                : "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground"
            }`}
          >
            <span className="text-xl leading-none">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.06] transition-colors cursor-pointer"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden lg:block">{current.name}</span>
        <span className="lg:hidden">{current.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-neutral-800 bg-neutral-950 text-foreground shadow-2xl overflow-hidden z-50 py-1 backdrop-blur-xl"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.locale}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (locale !== lang.locale) {
                    setLocale(lang.locale);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                  locale === lang.locale
                    ? "bg-foreground/[0.07] text-foreground font-semibold"
                    : "text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
