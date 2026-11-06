import React, { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ArrowRight, X, MapPin, Mail, Phone, Users, Share2, Check, Copy, ShieldCheck, FileText, Store, ClipboardList, TrendingUp, CircleDollarSign, Briefcase, Wrench, Building2, ShoppingBag, Handshake, LayoutGrid, Warehouse, GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { HeroCountdown } from "../components/HeroCountdown";
const RotatingGlobe = lazy(() => import("../components/RotatingGlobe").then((m) => ({ default: m.RotatingGlobe })));
import { PartnershipFormModal } from "../components/PartnershipFormModal";
import { getLegalModalData } from "../data/legalModalData";
import { subscribeHeroCounter, getCachedHeroCount, getCachedGroupCount } from "../lib/heroCounterService";
import { subscribeCtaConfig, getCachedCtaEnabled } from "../lib/ctaService";
import { getVideoIdForLocale, subscribeVideoConfig, getCachedVideoConfig, VideoEmbedConfig } from "../lib/videoEmbedService";
import { getCtaShareConfig } from "../lib/ctaShareConfig";
import {
  subscribeWebsiteContent,
  getCachedWebsiteContent,
  WebsiteContentConfig,
  getLocalizedText
} from "../lib/websiteContentService";

// Replace this with your actual YouTube video ID
const YOUTUBE_VIDEO_ID = "4dXRsOKTvqY";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  key?: React.Key | null;
}

function Section({ children, className = "" }: SectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Helper to format number according to locale
const formatNumberByLocale = (num: number, loc: string): string => {
  if (loc === "id" || loc === "de" || loc === "es" || loc === "pt" || loc === "tr") {
    return num.toLocaleString("de-DE");
  }
  if (loc === "fr" || loc === "ru") {
    return num.toLocaleString("fr-FR");
  }
  return num.toLocaleString("en-US");
};


// Pemutar video hero: tampilan embed YouTube ORIGINAL (API resmi YouTube),
// ditambah satu perintah: begitu video mulai diputar, langsung layar penuh —
// supaya tombol-tombol bawaan YouTube (resume, tonton nanti, bagikan) tertutup.
function HeroVideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const armedRef = useRef(true);
  const [apiReady, setApiReady] = useState(false);
  const [shouldInit, setShouldInit] = useState(false);

  // Pemutar YouTube TIDAK ikut dimuat di awal: halaman (teks, angka, tombol)
  // tampil dulu, pemutar baru dimulai saat browser senggang — supaya situs
  // terasa cepat di jaringan lambat. Pemutarnya sendiri tetap original.
  useEffect(() => {
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout: number }) => number);
    if (typeof ric === "function") {
      const id = ric(() => setShouldInit(true), { timeout: 1500 });
      return () => { const cic = (window as any).cancelIdleCallback; if (typeof cic === "function") cic(id); };
    }
    const t = window.setTimeout(() => setShouldInit(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!shouldInit) return;
    const w = window as any;
    if (w.YT?.Player) { setApiReady(true); return; }
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => { if (typeof prev === "function") prev(); setApiReady(true); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, [shouldInit]);

  useEffect(() => {
    if (!apiReady || !wrapRef.current) return;
    armedRef.current = true;
    const holder = document.createElement("div");
    holder.className = "w-full h-full";
    wrapRef.current.appendChild(holder);
    const player = new (window as any).YT.Player(holder, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: { controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, disablekb: 1, playsinline: 0 },
      events: {
        onStateChange: (e: any) => {
          const YT = (window as any).YT;
          if (e.data === YT.PlayerState.PLAYING && armedRef.current) {
            armedRef.current = false;
            try {
              const iframe = e.target.getIframe?.();
              if (iframe && !document.fullscreenElement) {
                const p = iframe.requestFullscreen?.();
                if (p && typeof p.catch === "function") p.catch(() => {});
              }
            } catch { /* tidak semua browser mengizinkan fullscreen dari kode */ }
          }
        },
      },
    });
    return () => { try { player.destroy(); } catch { /* abaikan */ } holder.remove(); };
  }, [apiReady, videoId]);

  if (!shouldInit) {
    return <div className="absolute inset-0 w-full h-full bg-black" aria-hidden="true" />;
  }
  if (!apiReady) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    );
  }
  return <div ref={wrapRef} className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />;
}

export default function Home() {
  const { t, locale } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'about' | 'contact' | 'share' | 'terms' | 'privacy'>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<Array<{ id: number; name: string; quote: string; photo: string | null; detail: string | null }>>([]);

  // Testimonials managed from the admin panel (shown above the CTA).
  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.data)) setTestimonials(d.data); })
      .catch(() => {});
  }, []);
    const [memberCount, setMemberCount] = useState<number>(getCachedHeroCount);
  const [groupCount, setGroupCount] = useState<number>(getCachedGroupCount);
  const [ctaEnabled, setCtaEnabled] = useState<boolean>(getCachedCtaEnabled);
  const [videoConfig, setVideoConfig] = useState<VideoEmbedConfig>(getCachedVideoConfig);
  const [contentConfig, setContentConfig] = useState<WebsiteContentConfig>(getCachedWebsiteContent);

  const shareConfig = useMemo(() => getCtaShareConfig(locale), [locale]);



  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => document.removeEventListener("scroll", handleScroll);
  }, []);

  // Real-time synchronized website content (video, images, text) from Cloudflare
  useEffect(() => {
    const unsubscribe = subscribeWebsiteContent((config) => {
      setContentConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronized CTA visibility settings from Cloudflare
  useEffect(() => {
    const unsubscribe = subscribeCtaConfig((config) => {
      setCtaEnabled(config.enabled);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronized Video Embed visibility settings from Cloudflare
  useEffect(() => {
    const unsubscribe = subscribeVideoConfig((config) => {
      setVideoConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronized live counter from Cloudflare (shared across all visitors)
  useEffect(() => {
    const unsubscribe = subscribeHeroCounter((config) => {
      if (config) {
        if (typeof config.currentCount === "number") {
          setMemberCount(config.currentCount);
        }
        if (typeof config.groupCount === "number") {
          setGroupCount(config.groupCount);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const legalData = useMemo(() => getLegalModalData(locale), [locale]);
  const navLinks = useMemo(() => [
    { href: "#features", label: t("nav_features") },
  ], [t]);

  // Video ID priority: per-language video (videoConfig.perLocale) > videoConfig global > contentConfig
  const isVideoEnabled = contentConfig.videoEnabled !== undefined ? contentConfig.videoEnabled : videoConfig.enabled;
  const activeVideoId = getVideoIdForLocale(videoConfig, locale) || contentConfig.youtubeVideoId || YOUTUBE_VIDEO_ID;
  // Show the lightweight poster again whenever the per-language video changes.

  // Custom headline or localized default
  const headline = getLocalizedText(contentConfig, locale, 'heroHeadline', t("hero_headline"));
  const headlineParts = useMemo(() => {
    return headline.split(/(\{count\}|\{groups\})/g);
  }, [headline]);

  const ctaButtonLabel = useMemo(() => {
    if (contentConfig.ctaButtonText && contentConfig.ctaButtonText.trim()) {
      return contentConfig.ctaButtonText;
    }
    const map: Record<string, string> = {
      "id-ID": "Daftar untuk Dicocokkan",
      "en-US": "Register to Get Matched",
      "es-ES": "Regístrate para que te emparejemos",
      "fr-FR": "S'inscrire pour être mis en relation",
      "ja-JP": "マッチング希望で登録する",
      "ar-SA": "سجّل ليتم التوفيق بينك وبين شريك",
      "ko-KR": "매칭받으려면 등록하세요",
      "pt-PT": "Registre-se para ser emparelhado",
      "zh-CN": "注册以获取匹配",
      "ru-RU": "Зарегистрироваться для подбора",
    };
    return map[locale] || "Daftar untuk Dicocokkan";
  }, [contentConfig.ctaButtonText, locale]);

  const opportunityIntro = useMemo(() => {
    const map: Record<string, string> = {
      "id-ID": "Berbagai peluang dalam satu platform.",
      "en-US": "Many kinds of opportunities in one platform.",
      "es-ES": "Diversas oportunidades en una sola plataforma.",
      "fr-FR": "De nombreuses opportunités sur une seule plateforme.",
      "ja-JP": "さまざまな機会を、1つのプラットフォームで。",
      "ar-SA": "فرص متنوعة في منصة واحدة.",
      "ko-KR": "다양한 기회를 하나의 플랫폼에서.",
      "pt-PT": "Várias oportunidades numa única plataforma.",
      "zh-CN": "多种机会，一个平台。",
      "ru-RU": "Разнообразные возможности на одной платформе.",
    };
    return map[locale] || map["id-ID"];
  }, [locale]);

  const opportunityTypes = useMemo(() => {
    const labels: Record<string, string[]> = {
      "id-ID": ["Bisnis & Kemitraan", "Proyek", "Investasi & Pendanaan", "Pekerjaan", "Jasa & Keahlian", "Perdagangan", "Kolaborasi Lainnya"],
      "en-US": ["Business & Partnership", "Projects", "Investment & Funding", "Jobs", "Services & Skills", "Trade", "Other Collaboration"],
      "es-ES": ["Negocios y Alianzas", "Proyectos", "Inversión y Financiación", "Empleo", "Servicios y Habilidades", "Comercio", "Otras Colaboraciones"],
      "fr-FR": ["Affaires et Partenariats", "Projets", "Investissement et Financement", "Emploi", "Services et Compétences", "Commerce", "Autres Collaborations"],
      "ja-JP": ["ビジネスと提携", "プロジェクト", "投資と資金調達", "仕事", "サービスとスキル", "取引", "その他のコラボレーション"],
      "ar-SA": ["أعمال وشراكات", "مشاريع", "استثمار وتمويل", "وظائف", "خدمات ومهارات", "تجارة", "تعاون آخر"],
      "ko-KR": ["비즈니스 및 파트너십", "프로젝트", "투자 및 자금 조달", "일자리", "서비스 및 기술", "무역", "기타 협업"],
      "pt-PT": ["Negócios e Parcerias", "Projetos", "Investimento e Financiamento", "Empregos", "Serviços e Competências", "Comércio", "Outras Colaborações"],
      "zh-CN": ["商业与合作", "项目", "投资与融资", "工作", "服务与技能", "贸易", "其他合作"],
      "ru-RU": ["Бизнес и партнёрство", "Проекты", "Инвестиции и финансирование", "Работа", "Услуги и навыки", "Торговля", "Другое сотрудничество"],
    };
    const icons = [Store, ClipboardList, TrendingUp, Briefcase, Wrench, ShoppingBag, Users];
    const names = labels[locale] || labels["id-ID"];
    return icons.map((icon, i) => ({ icon, label: names[i] }));
  }, [locale]);

  const FEATURES = useMemo(() => [
    {
      title: getLocalizedText(contentConfig, locale, 'feature1Title', t("feature_1_title")),
      desc: getLocalizedText(contentConfig, locale, 'feature1Desc', t("feature_1_desc")),
      image: (contentConfig as unknown as Record<string, string>)["feature1Image_" + locale] || contentConfig.feature1Image,
      alt: getLocalizedText(contentConfig, locale, 'feature1Title', "Mulai Bersama"),
    },
    {
      title: getLocalizedText(contentConfig, locale, 'feature2Title', t("feature_2_title")),
      desc: getLocalizedText(contentConfig, locale, 'feature2Desc', t("feature_2_desc")),
      image: (contentConfig as unknown as Record<string, string>)["feature2Image_" + locale] || contentConfig.feature2Image,
      alt: getLocalizedText(contentConfig, locale, 'feature2Title', "Temukan & Gabung Peluang"),
    },
    {
      title: getLocalizedText(contentConfig, locale, 'feature3Title', t("feature_3_title")),
      desc: getLocalizedText(contentConfig, locale, 'feature3Desc', t("feature_3_desc")),
      image: (contentConfig as unknown as Record<string, string>)["feature3Image_" + locale] || contentConfig.feature3Image,
      alt: getLocalizedText(contentConfig, locale, 'feature3Title', "Belajar dan Berkembang"),
    },
  ], [t, locale, contentConfig]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-[hsl(var(--brand-accent)/0.3)]">

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center shrink-0">
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              PartnerFind
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-foreground/80">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground transition-colors py-1">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right — language selector */}
          <div className="hidden md:flex items-center">
            <LanguageSwitcher variant="desktop" />
          </div>

          {/* Mobile right — language selector */}
          <div className="flex md:hidden items-center">
            <LanguageSwitcher variant="desktop" />
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className={`relative overflow-hidden transition-all duration-300 ${
          isVideoEnabled
            ? "min-h-[100svh] flex items-center pt-28 sm:pt-32 pb-8"
            : "pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-10"
        }`}
      >
        {/* Background glow */}
        <div
          className={`absolute ${isVideoEnabled ? "top-[30%]" : "top-[25%] sm:top-[28%]"} left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(700px,90vw)] aspect-square rounded-full pointer-events-none transition-all duration-500`}
          style={{ background: "radial-gradient(circle, hsl(var(--brand-accent)/0.18) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-0 right-[-10%] w-[min(500px,70vw)] aspect-square rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--brand-accent)/0.07) 0%, transparent 70%)", filter: "blur(80px)" }}
        />

        <div className="container mx-auto px-5 sm:px-8 relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto text-center"
          >
            <motion.h1
              variants={fadeUp}
              className={`max-w-4xl mx-auto text-[clamp(2.15rem,7vw,3.9rem)] font-black tracking-tight leading-[1.15] ${
                isVideoEnabled ? "mb-6 sm:mb-8" : "mb-8 sm:mb-10 md:mb-12"
              } whitespace-pre-line text-balance text-foreground transition-all duration-300`}
            >
              <span>
                {headlineParts.map((part, idx) => {
                  if (part === "{count}") {
                    return (
                      <span key={`member-${idx}`} className="relative overflow-hidden inline-flex items-baseline align-baseline mx-0.5">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={memberCount}
                            initial={{ y: "50%", opacity: 0, scale: 0.96 }}
                            animate={{ y: "0%", opacity: 1, scale: 1 }}
                            exit={{ y: "-50%", opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
                            className="inline-block text-foreground font-black tracking-tight"
                          >
                            {formatNumberByLocale(memberCount, locale)}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    );
                  }
                  if (part === "{groups}") {
                    return (
                      <span key={`group-${idx}`} className="relative overflow-hidden inline-flex items-baseline align-baseline mx-0.5">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={groupCount}
                            initial={{ y: "50%", opacity: 0, scale: 0.96 }}
                            animate={{ y: "0%", opacity: 1, scale: 1 }}
                            exit={{ y: "-50%", opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
                            className="inline-block text-foreground font-black tracking-tight"
                          >
                            {formatNumberByLocale(groupCount, locale)}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    );
                  }
                  return <React.Fragment key={idx}>{part}</React.Fragment>;
                })}
              </span>
            </motion.h1>

            {/* ── FLAGSHIP VIDEO SHOWCASE (Dapat diaktifkan/dinonaktifkan via Admin) ── */}
            {isVideoEnabled && (
              <motion.div variants={fadeUp} className="w-full max-w-5xl mx-auto mb-10 sm:mb-12 relative">
                {/* Soft, subtle atmospheric ambient light */}
                <div
                  className="pointer-events-none absolute -inset-4 sm:-inset-8 rounded-2xl sm:rounded-3xl opacity-30 blur-3xl transition-opacity duration-700 -z-10"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(var(--brand-accent) / 0.45) 0%, transparent 70%)",
                  }}
                />

                {/* Modern Minimalist Video Embed (Enlarged with smooth rounded corners) */}
                <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)]">
                  {/* Sleek top specular highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                  <div
                    className="relative w-full bg-black"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <HeroVideoPlayer videoId={activeVideoId} title={contentConfig.videoTitle || "PartnerFind Platform Overview"} />
                  </div>
                </div>
              </motion.div>
            )}


            {/* ── TOMBOL DAFTAR HERO (LEBIH PANJANG DENGAN ROUNDED-FULL & MAGNETIK) ── */}
            <motion.div variants={fadeUp} className="w-full max-w-sm mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              <div className="relative group w-full">
                {/* Subtle Refined Halo Glow */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-0.5 rounded-full blur-sm opacity-30 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "hsl(var(--brand-accent))",
                  }}
                />

                {/* Primary Button */}
                <button
                  type="button"
                  onClick={() => setIsPartnershipModalOpen(true)}
                  className="relative w-full h-12 px-6 rounded-full font-black text-sm sm:text-base text-neutral-950 transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_2px_10px_hsl(var(--brand-accent)/0.25)] hover:shadow-[0_4px_16px_hsl(var(--brand-accent)/0.35)] hover:scale-[1.02] active:scale-[0.98] border border-white/20 flex items-center justify-center gap-2.5"
                  style={{ background: "hsl(var(--brand-accent))" }}
                >
                  {/* Top specular reflection */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                  {/* Kilatan cahaya menyapu berkala (Periodic Light Flash) */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-btn-flash" />

                  {/* Kilatan cahaya ekstra saat kursor mengarah (Hover Flash) */}
                  <div className="absolute -inset-full w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                  {/* Button text */}
                  <span className="relative z-10 font-black tracking-tight whitespace-nowrap">
                    {ctaButtonLabel}
                  </span>

                  {/* Arrow icon with hover forward slide */}
                  <ArrowRight className="w-4 h-4 shrink-0 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>

            {/* Opportunity types — compact icon chips under the hero button */}
            <div className="mt-6 text-center">
              <p className="text-xs sm:text-[13px] text-foreground/55 mb-2.5">{opportunityIntro}</p>
              <div className="flex flex-col items-center gap-1.5 max-w-xl mx-auto px-0">
                {[[0, 1], [2, 3], [4, 5, 6]].map((row, r) => (
                  <div key={r} className="flex flex-wrap items-center justify-center gap-1">
                    {row.map((i) => {
                      const { icon: Icon, label } = opportunityTypes[i];
                      return (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-foreground/75 whitespace-nowrap"
                        >
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: "hsl(var(--brand-accent))" }} />
                          {label}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Countdown Timer Display (Large & prominent under video/headline) */}
            <motion.div variants={fadeUp} className="w-full max-w-3xl mx-auto">
              <HeroCountdown />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES / SECTION 2 (Original Checkmark & Connector Design with Image above Title) ── */}
      <section
        id="features"
        className={`relative overflow-hidden transition-all duration-300 ${
          !ctaEnabled
            ? "pt-6 sm:pt-8 pb-20 sm:pb-28 lg:pb-32"
            : "pt-6 sm:pt-8 pb-14 sm:pb-16"
        }`}
      >
        <div
          className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[min(400px,60vw)] aspect-square rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--brand-accent)/0.08) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="relative z-10 pl-2 sm:pl-4 pr-5 sm:pr-8 max-w-7xl mx-auto">
          <Section className="mb-10 text-center max-w-3xl mx-auto">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {getLocalizedText(contentConfig, locale, 'featuresLabel', t("features_label"))}
            </motion.h2>
          </Section>

          <Section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-7 gap-y-10">
            {FEATURES.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="relative flex items-stretch">
                {/* Numbered step badge + connector container */}
                <div className="relative flex flex-col items-center mr-3.5 sm:mr-4 shrink-0">
                  <div
                    className="relative z-10 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full border border-white/20 transition-colors duration-300 font-mono"
                    style={{
                      background: "hsl(var(--brand-accent))",
                      boxShadow: "0 4px 12px hsl(var(--brand-accent)/0.35)",
                    }}
                  >
                    <span className="text-white font-black text-xs leading-none">{i + 1}</span>
                  </div>

                  {/* Continuous vertical line on mobile spanning through card height and bridging the grid gap */}
                  {i !== FEATURES.length - 1 && (
                    <div
                      className="w-[1.5px] bg-white/20 flex-1 lg:hidden"
                      style={{ marginBottom: "-40px" }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Desktop horizontal connector line bridging to the next column */}
                {i !== FEATURES.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-3 sm:top-3.5 left-6 sm:left-7 right-[-24px] lg:right-[-28px] h-[1.5px] bg-white/20 z-0 pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/* Point Content: Image above Title & Description */}
                <div className="pb-4 pt-0 flex-1 min-w-0">
                  {/* Image above Title (Standard 16:9 Aspect Ratio) */}
                  {item.image && (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 mb-3.5 relative group/img">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.parentElement?.style.setProperty("display", "none");
                      }}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  )}

                  <h3 className="text-[17px] sm:text-[18.5px] font-bold mb-2 leading-snug text-white">
                    {item.title}
                  </h3>

                  <p className="text-[15.5px] sm:text-[16px] text-zinc-200 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </Section>

          {/* Transisi halus ketika CTA disembunyikan */}
          {!ctaEnabled && (
            <div className="mt-14 sm:mt-18 flex justify-center">
              <div
                className="w-36 sm:w-52 h-[1px] opacity-30 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--brand-accent)), transparent)",
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS (di atas CTA; hanya tampil bila ada testimoni asli) ── */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20 bg-background relative z-10 overflow-hidden">
          <div className="container mx-auto px-5 sm:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-foreground mb-10">
              {{
                "id-ID": "Apa Kata Mereka",
                "en-US": "What They Say",
                "es-ES": "Lo que dicen",
                "fr-FR": "Ce qu'ils disent",
                "ja-JP": "利用者の声",
                "ar-SA": "ماذا يقولون",
                "ko-KR": "이용자 후기",
                "pt-PT": "O que dizem",
                "zh-CN": "用户评价",
                "ru-RU": "Что говорят",
              }[locale] || "Apa Kata Mereka"}
            </h2>
            <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
              {testimonials.map((item) => (
                <figure
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center flex flex-col items-center"
                >
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/15 mb-4"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/15 mb-4 flex items-center justify-center text-xl font-extrabold text-foreground">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <blockquote className="text-sm leading-relaxed text-foreground/80">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-4">
                    <div className="font-bold text-sm text-foreground">{item.name}</div>
                    {item.detail && (
                      <div className="text-xs text-foreground/50 mt-0.5">{item.detail}</div>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MINIMALIST CTA SECTION (Dapat diaktifkan/dinonaktifkan via Admin) ── */}
      {ctaEnabled && (
        <section className="py-20 sm:py-24 bg-background relative z-10 text-center overflow-hidden">
          {/* Cahaya ambient warna aksen bahasa */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] sm:w-[580px] h-[260px] sm:h-[320px] rounded-full pointer-events-none opacity-30 blur-3xl -z-10 transition-all duration-700"
            style={{
              background: "radial-gradient(circle, hsl(var(--brand-accent)) 0%, transparent 70%)",
            }}
          />

          <div className="container mx-auto px-5 sm:px-8">
            <Section className="max-w-2xl mx-auto flex flex-col items-center">
              <motion.p
                variants={fadeUp}
                className="text-2xl sm:text-3xl md:text-4xl text-foreground font-bold tracking-tight leading-snug mb-8 max-w-2xl mx-auto text-center"
              >
                {getLocalizedText(contentConfig, locale, 'ctaSubheadline', t("cta_subheadline"))}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex items-center justify-center"
              >
                <div className="relative group inline-flex items-center justify-center">
                  {/* Subtle Refined Halo Glow */}
                  <div
                    aria-hidden="true"
                    className="absolute -inset-0.5 rounded-full blur-sm opacity-30 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "hsl(var(--brand-accent))",
                    }}
                  />

                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={() => setIsPartnershipModalOpen(true)}
                    className="relative inline-flex items-center justify-center gap-2.5 px-8 sm:px-9 h-12 rounded-full font-black text-sm sm:text-base text-neutral-950 transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_2px_10px_hsl(var(--brand-accent)/0.25)] hover:shadow-[0_4px_16px_hsl(var(--brand-accent)/0.35)] hover:scale-[1.03] active:scale-[0.97] border border-white/20"
                    style={{
                      background: "hsl(var(--brand-accent))",
                    }}
                  >
                    {/* Top specular reflection */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                    {/* Kilatan cahaya menyapu berkala (Periodic Light Flash) */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-btn-flash" />

                    {/* Kilatan cahaya ekstra saat kursor mengarah (Hover Flash) */}
                    <div className="absolute -inset-full w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Button text */}
                    <span className="relative z-10 font-black tracking-tight whitespace-nowrap">
                      {ctaButtonLabel}
                    </span>

                    {/* Arrow icon with hover forward slide */}
                    <ArrowRight className="w-4 h-4 shrink-0 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </Section>
          </div>
        </section>
      )}

      {/* ── ROTATING GLOBE (SEAMLESS CONTINUOUS BACKGROUND) ── */}
      <section className={`relative z-10 w-full overflow-hidden bg-background ${!ctaEnabled ? "pt-4 sm:pt-6" : ""}`}>
        <Suspense fallback={null}>
          <RotatingGlobe />
        </Suspense>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 py-8 bg-background relative z-20 text-[13px] text-foreground/70">
        <div className="container mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11.5px] text-foreground/60 font-mono text-center sm:text-left">
            {getLocalizedText(contentConfig, locale, 'footerCopyright', t("footer_copyright"))}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="text-foreground/70 hover:text-foreground hover:underline transition-colors cursor-pointer font-medium"
            >
              {t("footer_company_about")}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="text-foreground/70 hover:text-foreground hover:underline transition-colors cursor-pointer font-medium"
            >
              {t("footer_terms")}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="text-foreground/70 hover:text-foreground hover:underline transition-colors cursor-pointer font-medium"
            >
              {t("footer_privacy")}
            </button>
          </div>
        </div>
      </footer>

      {/* ── MODALS SYSTEM FOR TRANSPARENCY ── */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] text-left shadow-2xl text-card-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  {activeModal === 'about' && <Users className="w-5 h-5" style={{ color: "hsl(var(--brand-accent))" }} />}
                  {activeModal === 'terms' && <FileText className="w-5 h-5" style={{ color: "hsl(var(--brand-accent))" }} />}
                  {activeModal === 'privacy' && <ShieldCheck className="w-5 h-5" style={{ color: "hsl(var(--brand-accent))" }} />}
                  {activeModal === 'contact' && <MapPin className="w-5 h-5" style={{ color: "hsl(var(--brand-accent))" }} />}
                  {activeModal === 'share' && <Share2 className="w-5 h-5" style={{ color: "hsl(var(--brand-accent))" }} />}
                  <h3 className="font-bold text-lg text-foreground">
                    {activeModal === 'about' && t("footer_company_about")}
                    {activeModal === 'terms' && t("footer_terms")}
                    {activeModal === 'privacy' && t("footer_privacy")}
                    {activeModal === 'contact' && t("footer_company_contact")}
                    {activeModal === 'share' && shareConfig.shareTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body with High-Contrast Readable Text */}
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-foreground/80 leading-relaxed">
                {activeModal === 'share' && (
                  <div className="space-y-4">
                    <p className="text-sm text-foreground/80">
                      {shareConfig.shareMessage}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareConfig.shareMessage + "\n" + (typeof window !== "undefined" ? window.location.href : ""))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-semibold text-xs transition-colors"
                      >
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(shareConfig.shareMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] border border-[#0088cc]/30 font-semibold text-xs transition-colors"
                      >
                        <span>Telegram</span>
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareConfig.shareMessage)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground border border-foreground/20 font-semibold text-xs transition-colors"
                      >
                        <span>X / Twitter</span>
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-[#0A66C2] border border-[#0A66C2]/30 font-semibold text-xs transition-colors"
                      >
                        <span>LinkedIn</span>
                      </a>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-2 bg-muted/70 border border-border rounded-xl p-1.5 pl-3">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== "undefined" ? window.location.href : ""}
                          className="bg-transparent text-xs text-foreground/80 w-full outline-none select-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (typeof window !== "undefined" && navigator.clipboard) {
                              await navigator.clipboard.writeText(window.location.href);
                              setShareCopied(true);
                              setTimeout(() => setShareCopied(false), 2500);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg font-semibold text-xs text-white shrink-0 transition-opacity hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                          style={{ background: "hsl(var(--brand-accent))" }}
                        >
                          {shareCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{shareConfig.copiedToast}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{shareConfig.label}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeModal === 'about' && (
                  <>
                    <p>
                      {legalData.about.intro}
                    </p>
                    <p>
                      <strong className="text-foreground">{legalData.about.flowTitle}</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-foreground/80">
                      {legalData.about.steps.map((step, idx) => (
                        <li key={idx}>
                          <strong className="text-foreground">{step.bold} </strong>
                          {step.text}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeModal === 'terms' && (
                  <div className="space-y-3">
                    <p>{legalData.terms.intro}</p>
                    <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                      {legalData.terms.points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeModal === 'privacy' && (
                  <div className="space-y-3">
                    <p>{legalData.privacy.intro}</p>
                    <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                      {legalData.privacy.points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeModal === 'contact' && (
                  <>
                    <p className="text-foreground/80">
                      {legalData.contact.intro}
                    </p>
                    {(legalData.contact.email || legalData.contact.phone) && (
                      <div className="bg-muted/70 p-4 rounded-xl border border-border space-y-2">
                        {legalData.contact.email && (
                          <div className="flex items-center gap-2 text-foreground/90">
                            <Mail className="w-4 h-4 text-sky-500" />
                            <span>{legalData.contact.email}</span>
                          </div>
                        )}
                        {legalData.contact.phone && (
                          <div className="flex items-center gap-2 text-foreground/90">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            <span>{legalData.contact.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-muted/40 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-border"
                >
                  {t("nav_close") || "Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tally registration form opened by the Hero and CTA buttons. */}
      <PartnershipFormModal
        isOpen={isPartnershipModalOpen}
        onClose={() => setIsPartnershipModalOpen(false)}
      />
    </div>
  );
}
