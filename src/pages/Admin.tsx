import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../lib/cloudflareApi';
import { 
  Loader2, 
  LogOut, 
  EyeOff, 
  ShieldAlert,
  ExternalLink,
  KeyRound,
  Users,
  Sliders,
  Timer,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Type,
  RotateCcw,
  Save,
  Sparkles,
  Layers,
  Megaphone,
  Star,
} from 'lucide-react';
import {
  saveHeroRulesConfig,
  overrideHeroCount,
  saveGroupRulesConfig,
  overrideGroupCount,
  subscribeHeroCounter,
  HeroCounterConfig,
  DEFAULT_HERO_COUNTER
} from '../lib/heroCounterService';
import { translations } from '../lib/translations';
import {
  AnnouncementBarConfig,
  DEFAULT_ANNOUNCEMENT,
  saveAnnouncementConfig,
  subscribeAnnouncement
} from '../lib/announcementService';
import {
  WebsiteContentConfig,
  DEFAULT_WEBSITE_CONTENT,
  PRESET_IMAGES,
  getCachedWebsiteContent,
  subscribeWebsiteContent,
  saveWebsiteContent,
  extractYoutubeId as extractYoutubeCleanId
} from '../lib/websiteContentService';
import { AdminImagePicker } from '../components/AdminImagePicker';
import InvitersTab from '../components/InvitersTab';
import TestimonialsTab from '../components/TestimonialsTab';
import { DEFAULT_TALLY_URLS } from '../lib/tallyConfig';

const ADMIN_EMAIL = 'dikyindra444@gmail.com';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState(ADMIN_EMAIL);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  // Polling must never overwrite a form the admin is editing: once a field in
  // a group changes, that group is dirty and poll results skip its inputs
  // until a successful save clears the flag.
  const memberDirtyRef = useRef(false);
  const groupDirtyRef = useRef(false);
  const announcementDirtyRef = useRef(false);
  const lastLiveMemberRef = useRef<number | null>(null);
  const lastLiveGroupRef = useRef<number | null>(null);
  
  // 2 Admin choices: 'content' (Atur Konten Website) | 'rules' (Angka Live & Countdown)
  const [activeTab, setActiveTab] = useState<'content' | 'rules' | 'inviters' | 'testimonials'>('content');
  const [rulesFilter, setRulesFilter] = useState<'all' | 'hero' | 'group' | 'countdown'>('all');
  
  // ── Website Content State (Embed Video, Gambar, Teks) ──
  const [contentConfig, setContentConfig] = useState<WebsiteContentConfig>(getCachedWebsiteContent);
  const [contentForm, setContentForm] = useState<WebsiteContentConfig>(getCachedWebsiteContent);
  const [contentSubTab, setContentSubTab] = useState<'all' | 'images' | 'texts'>('all');
  const [savingContent, setSavingContent] = useState(false);
  const [contentSuccessMsg, setContentSuccessMsg] = useState('');
  const [activeTextLang, setActiveTextLang] = useState<string>('id-ID');

  const SUPPORTED_ADMIN_LANGUAGES = [
    { code: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en-US', label: 'English', flag: '🇬🇧' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { code: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
  ];

  const getFormText = (field: keyof WebsiteContentConfig): string => {
    if (activeTextLang === 'id-ID') {
      return (contentForm[field] as string) || '';
    }
    return contentForm.texts?.[activeTextLang]?.[field as string] || '';
  };

  const handleFormTextChange = (field: string, value: string) => {
    setContentForm((prev) => {
      if (activeTextLang === 'id-ID') {
        return {
          ...prev,
          [field]: value,
        };
      }
      const currentTexts = prev.texts || {};
      const langTexts = currentTexts[activeTextLang] || {};
      return {
        ...prev,
        texts: {
          ...currentTexts,
          [activeTextLang]: {
            ...langTexts,
            [field]: value,
          },
        },
      };
    });
  };

  const getFormTallyUrl = (): string => {
    return contentForm.tallyEmbedUrls?.[activeTextLang] || DEFAULT_TALLY_URLS[activeTextLang] || '';
  };

  const handleFormTallyUrlChange = (value: string) => {
    setContentForm((prev) => ({
      ...prev,
      tallyEmbedUrls: {
        ...(prev.tallyEmbedUrls || {}),
        [activeTextLang]: value,
      },
    }));
  };

  const handleAutoTranslateCurrentLang = () => {
    if (activeTextLang === 'id-ID') {
      alert('Bahasa Indonesia adalah bahasa utama (default).');
      return;
    }
    const langDict = (translations as any)[activeTextLang];
    if (!langDict) {
      alert('Terjemahan bawaan untuk bahasa ini tidak ditemukan.');
      return;
    }

    const translatedFields = {
      heroHeadline: langDict.hero_headline || '',
      heroSubheadline: langDict.hero_subheadline || '',
      searchPlaceholder: langDict.search_placeholder || '',
      countdownTitle: langDict.countdown_title || 'Pra Registrasi ditutup dalam',
      featuresLabel: langDict.features_label || '',
      feature1Title: langDict.feature_1_title || '',
      feature1Desc: langDict.feature_1_desc || '',
      feature2Title: langDict.feature_2_title || '',
      feature2Desc: langDict.feature_2_desc || '',
      feature3Title: langDict.feature_3_title || '',
      feature3Desc: langDict.feature_3_desc || '',
      ctaSubheadline: langDict.cta_subheadline || '',
      ctaButtonText: langDict.nav_cta || langDict.cta_button || '',
      footerCopyright: langDict.footer_copyright || '',
    };

    setContentForm((prev) => {
      const currentTexts = prev.texts || {};
      return {
        ...prev,
        texts: {
          ...currentTexts,
          [activeTextLang]: {
            ...translatedFields,
          },
        },
      };
    });

    setContentSuccessMsg(`Berhasil memuat terjemahan otomatis ke ${SUPPORTED_ADMIN_LANGUAGES.find(l => l.code === activeTextLang)?.label}! Jangan lupa klik Simpan Konten.`);
    setTimeout(() => setContentSuccessMsg(''), 6000);
  };
  
  // Announcement Bar state
  const [announcementConfig, setAnnouncementConfig] = useState<AnnouncementBarConfig>(DEFAULT_ANNOUNCEMENT);
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementMessage, setAnnouncementMessage] = useState('Pra Registrasi ditutup dalam');
  const [announcementMessageEn, setAnnouncementMessageEn] = useState('Collaboration registration closes in:');
  const [announcementTargetDate, setAnnouncementTargetDate] = useState('');
  const [announcementAutoRoll, setAnnouncementAutoRoll] = useState<number>(3);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementSuccessMsg, setAnnouncementSuccessMsg] = useState('');

  // Hero Counter state (Members)
  const [counterConfig, setCounterConfig] = useState<HeroCounterConfig>(DEFAULT_HERO_COUNTER);
  const [inputCurrentCount, setInputCurrentCount] = useState<string>('1000000');
  const [inputMinIncrement, setInputMinIncrement] = useState<string>('1');
  const [inputMaxIncrement, setInputMaxIncrement] = useState<string>('3');
  const [inputIntervalValue, setInputIntervalValue] = useState<string>('1');
  const [inputIntervalUnit, setInputIntervalUnit] = useState<'seconds' | 'minutes'>('minutes');

  // Hero Group Counter state (Groups Created)
  const [inputGroupCount, setInputGroupCount] = useState<string>('342180');
  const [inputGroupMinIncrement, setInputGroupMinIncrement] = useState<string>('1');
  const [inputGroupMaxIncrement, setInputGroupMaxIncrement] = useState<string>('2');
  const [inputGroupIntervalValue, setInputGroupIntervalValue] = useState<string>('2');
  const [inputGroupIntervalUnit, setInputGroupIntervalUnit] = useState<'seconds' | 'minutes'>('minutes');

  // Unified hero-numbers apply state
  const [applyingNumbers, setApplyingNumbers] = useState<boolean>(false);
  const [numbersMsg, setNumbersMsg] = useState<string>('');

  // Admin signs in with the admin password; the Worker verifies it and issues
  // an HttpOnly session cookie. First visit (no password stored yet) shows setup.
  useEffect(() => {
    let active = true;
    setLoginLoading(true);
    apiRequest<{ authenticated: boolean; email?: string; setupRequired?: boolean }>('/api/admin/session')
      .then((session) => {
        if (!active) return;
        if (session.setupRequired) { setSetupRequired(true); setAuthed(false); return; }
        setAuthed(session.authenticated === true);
        if (session.email) setCurrentAdminEmail(session.email);
      })
      .catch(() => {
        // 401 simply means "not signed in yet"; the password form is shown.
        if (active) setLoginError('');
      })
      .finally(() => {
        if (active) { setAuthChecked(true); setLoginLoading(false); }
      });
    return () => { active = false; };
  }, []);

  const handleSetupPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordInput.length < 8) { setLoginError('Password minimal 8 karakter.'); return; }
    if (passwordInput !== passwordConfirm) { setLoginError('Konfirmasi password tidak sama.'); return; }
    setAuthSubmitting(true); setLoginError('');
    try {
      await apiRequest('/api/admin/setup', { method: 'POST', body: { password: passwordInput } });
      setSetupRequired(false); setAuthed(true); setCurrentAdminEmail('Admin');
      setPasswordInput(''); setPasswordConfirm('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Gagal membuat password.');
    } finally { setAuthSubmitting(false); }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthSubmitting(true); setLoginError('');
    try {
      await apiRequest('/api/admin/login', { method: 'POST', body: { password: passwordInput } });
      setAuthed(true); setCurrentAdminEmail('Admin'); setPasswordInput('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Gagal masuk.');
    } finally { setAuthSubmitting(false); }
  };
  // Poll shared hero-counter configuration from Cloudflare
  useEffect(() => {
    if (!authed) return;
    const unsubscribe = subscribeHeroCounter((config) => {
      setCounterConfig(config);
      if (Number.isFinite(Number(config.currentCount))) lastLiveMemberRef.current = Number(config.currentCount);
      if (Number.isFinite(Number(config.groupCount))) lastLiveGroupRef.current = Number(config.groupCount);
      if (!memberDirtyRef.current) {
        setInputMinIncrement(String(config.minIncrement ?? 1));
        setInputMaxIncrement(String(config.maxIncrement ?? 3));
        setInputIntervalValue(String(config.intervalValue ?? 1));
        if (config.intervalUnit) setInputIntervalUnit(config.intervalUnit);
      }
      if (!groupDirtyRef.current) {
        setInputGroupMinIncrement(String(config.groupMinIncrement ?? 1));
        setInputGroupMaxIncrement(String(config.groupMaxIncrement ?? 2));
        setInputGroupIntervalValue(String(config.groupIntervalValue ?? 2));
        if (config.groupIntervalUnit) setInputGroupIntervalUnit(config.groupIntervalUnit);
      }
    });
    return () => unsubscribe();
  }, [authed]);

  // Poll website content from Cloudflare
  useEffect(() => {
    if (!authed) return;
    const unsubscribe = subscribeWebsiteContent((config) => {
      setContentConfig(config);
      setContentForm((prev) => ({
        ...config,
        ...prev,
      }));
    });
    return () => unsubscribe();
  }, [authed]);

  const hasInitializedRulesRef = useRef(false);
  const prevTabRef = useRef<'content' | 'rules' | 'inviters' | 'testimonials'>('content');

  useEffect(() => {
    if (!counterConfig) return;

    const isSwitchingToRules = prevTabRef.current !== 'rules' && activeTab === 'rules';
    const isFirstInit = !hasInitializedRulesRef.current && activeTab === 'rules';

    if (isFirstInit || isSwitchingToRules) {
      setInputMinIncrement(String(counterConfig.minIncrement || 1));
      setInputMaxIncrement(String(counterConfig.maxIncrement || 3));
      
      const mUnit = counterConfig.intervalUnit || (counterConfig.intervalMinutes && counterConfig.intervalMinutes < 1 ? 'seconds' : 'minutes');
      const mVal = counterConfig.intervalValue !== undefined
        ? counterConfig.intervalValue
        : (mUnit === 'seconds' ? Math.round(counterConfig.intervalMinutes * 60) : counterConfig.intervalMinutes || 1);
      setInputIntervalUnit(mUnit);
      setInputIntervalValue(String(mVal));
      setInputCurrentCount(String(counterConfig.currentCount || 1000000));

      setInputGroupMinIncrement(String(counterConfig.groupMinIncrement || 1));
      setInputGroupMaxIncrement(String(counterConfig.groupMaxIncrement || 2));
      
      const gUnit = counterConfig.groupIntervalUnit || (counterConfig.groupIntervalMinutes && counterConfig.groupIntervalMinutes < 1 ? 'seconds' : 'minutes');
      const gVal = counterConfig.groupIntervalValue !== undefined
        ? counterConfig.groupIntervalValue
        : (gUnit === 'seconds' ? Math.round(counterConfig.groupIntervalMinutes * 60) : counterConfig.groupIntervalMinutes || 2);
      setInputGroupIntervalUnit(gUnit);
      setInputGroupIntervalValue(String(gVal));
      setInputGroupCount(String(counterConfig.groupCount || 342180));

      hasInitializedRulesRef.current = true;
    }

    if (activeTab === 'content' && prevTabRef.current !== 'content') {
      setContentForm((prev) => ({
        ...prev,
        ...contentConfig,
      }));
    }

    prevTabRef.current = activeTab;
  }, [activeTab, counterConfig, contentConfig]);

  const handleContentFieldChange = <K extends keyof WebsiteContentConfig>(
    field: K,
    value: WebsiteContentConfig[K]
  ) => {
    setContentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAllContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingContent(true);
    setContentSuccessMsg('');
    try {
      const cleanVideoId = extractYoutubeCleanId(contentForm.youtubeVideoId);
      const payload: Partial<WebsiteContentConfig> = {
        ...contentForm,
        youtubeVideoId: cleanVideoId,
      };
      const success = await saveWebsiteContent(payload, currentAdminEmail || 'admin');
      if (success) {
        setContentSuccessMsg('Pengaturan konten website berhasil disimpan dan disinkronkan!');
        setTimeout(() => setContentSuccessMsg(''), 5000);
      } else {
        alert('Gagal menyimpan pengaturan konten website ke database.');
      }
    } catch (err) {
      console.error('Error saving website content:', err);
      alert('Gagal menyimpan konten ke database.');
    } finally {
      setSavingContent(false);
    }
  };

  const handleResetToDefaultContent = async () => {
    if (!window.confirm('Kembalikan semua teks, gambar, dan pengaturan video ke default bawaan sistem?')) return;
    setSavingContent(true);
    setContentSuccessMsg('');
    try {
      const success = await saveWebsiteContent(DEFAULT_WEBSITE_CONTENT, currentAdminEmail || 'admin');
      if (success) {
        setContentForm(DEFAULT_WEBSITE_CONTENT);
        setContentSuccessMsg('Konten website berhasil dikembalikan ke pengaturan default!');
        setTimeout(() => setContentSuccessMsg(''), 4500);
      }
    } catch (err) {
      console.error('Error resetting content:', err);
    } finally {
      setSavingContent(false);
    }
  };

  // One apply action for every hero-number setting: member rules, group
  // rules, and the live counts (a count is only overridden when its field was
  // actually edited, so the constantly advancing live value is never rolled
  // back by accident).
  const handleApplyAllNumbers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const memberCount = parseInt(inputCurrentCount.replace(/[^0-9]/g, ''), 10);
    const groupCount = parseInt(inputGroupCount.replace(/[^0-9]/g, ''), 10);
    const overrideMember = Number.isFinite(memberCount) && lastLiveMemberRef.current !== null && memberCount !== lastLiveMemberRef.current;
    const overrideGroup = Number.isFinite(groupCount) && lastLiveGroupRef.current !== null && groupCount !== lastLiveGroupRef.current;
    if (overrideMember || overrideGroup) {
      const parts: string[] = [];
      if (overrideMember) parts.push(`angka anggota menjadi ${memberCount.toLocaleString('id-ID')}`);
      if (overrideGroup) parts.push(`angka grup menjadi ${groupCount.toLocaleString('id-ID')}`);
      if (!window.confirm(`Terapkan juga perubahan angka live (${parts.join(' dan ')})?`)) return;
    }
    setApplyingNumbers(true);
    setNumbersMsg('');
    try {
      const minIncrement = Math.max(1, parseInt(inputMinIncrement, 10) || 1);
      const maxIncrement = Math.max(minIncrement, parseInt(inputMaxIncrement, 10) || minIncrement);
      const groupMinIncrement = Math.max(1, parseInt(inputGroupMinIncrement, 10) || 1);
      const groupMaxIncrement = Math.max(groupMinIncrement, parseInt(inputGroupMaxIncrement, 10) || groupMinIncrement);
      const okMember = await saveHeroRulesConfig({ minIncrement, maxIncrement, intervalValue: Math.max(1, parseFloat(inputIntervalValue) || 1), intervalUnit: inputIntervalUnit });
      const okGroup = await saveGroupRulesConfig({ groupMinIncrement, groupMaxIncrement, groupIntervalValue: Math.max(1, parseFloat(inputGroupIntervalValue) || 1), groupIntervalUnit: inputGroupIntervalUnit });
      let okCounts = true;
      if (overrideMember) okCounts = (await overrideHeroCount(memberCount)) && okCounts;
      if (overrideGroup) okCounts = (await overrideGroupCount(groupCount)) && okCounts;
      if (okMember && okGroup && okCounts) {
        memberDirtyRef.current = false;
        groupDirtyRef.current = false;
        if (overrideMember) lastLiveMemberRef.current = memberCount;
        if (overrideGroup) lastLiveGroupRef.current = groupCount;
        setNumbersMsg('Semua pengaturan angka berhasil diterapkan!');
        setTimeout(() => setNumbersMsg(''), 5000);
      } else {
        alert('Sebagian pengaturan angka gagal disimpan. Coba lagi.');
      }
    } catch (err) {
      console.error('Gagal menerapkan pengaturan angka:', err);
      alert('Gagal menerapkan pengaturan angka.');
    } finally {
      setApplyingNumbers(false);
    }
  };

  const formatDatetimeLocal = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!authed) return;
    const unsubscribe = subscribeAnnouncement((cfg) => {
      setAnnouncementConfig(cfg);
      if (!announcementDirtyRef.current) {
        setAnnouncementEnabled(cfg.enabled);
        setAnnouncementMessage(cfg.message || '');
        setAnnouncementMessageEn(cfg.messageEn || '');
        setAnnouncementTargetDate(formatDatetimeLocal(cfg.targetDate));
        setAnnouncementAutoRoll(cfg.autoRollDays ?? 3);
      }
    });
    return () => unsubscribe();
  }, [authed]);

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    setAnnouncementSuccessMsg('');

    let finalIso = announcementConfig.targetDate;
    if (announcementTargetDate) {
      try {
        finalIso = new Date(announcementTargetDate).toISOString();
      } catch {
        finalIso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const ok = await saveAnnouncementConfig({
      enabled: announcementEnabled,
      badgeText: '',
      message: announcementMessage.trim(),
      messageEn: announcementMessageEn.trim(),
      targetDate: finalIso,
      buttonText: '',
      buttonTextEn: '',
      buttonLink: '',
      theme: 'accent',
      autoRollDays: announcementAutoRoll,
    });

    setSavingAnnouncement(false);
    if (ok) {
      announcementDirtyRef.current = false;
      setAnnouncementSuccessMsg('Pengaturan Announcement Bar & Countdown berhasil disimpan!');
      setTimeout(() => setAnnouncementSuccessMsg(''), 4500);
    } else {
      alert('Gagal menyimpan pengumuman ke database.');
    }
  };

  const handleLogout = async () => {
    try { await apiRequest('/api/admin/logout', { method: 'POST' }); } catch { /* abaikan */ }
    setAuthed(false);
    window.location.assign('/admin');
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 filter blur-[120px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="max-w-md w-full bg-neutral-950 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 shadow-inner">
            {loginLoading ? <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--brand-accent))]" /> : <KeyRound className="w-6 h-6 text-[hsl(var(--brand-accent))]" />}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">PartnerFind Admin Portal</h1>
          <p className="text-xs text-neutral-400 mt-2">{setupRequired ? 'Buat password admin untuk pertama kali.' : 'Masuk dengan password admin.'}</p>
          {loginError && <div className="mt-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-left"><ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" /><span className="text-xs text-destructive leading-relaxed font-medium">{loginError}</span></div>}
          {loginLoading || !authChecked ? (
            <p className="text-xs text-neutral-500 mt-6">Memeriksa sesi...</p>
          ) : setupRequired ? (
            <form onSubmit={handleSetupPassword} className="mt-6 space-y-3 text-left">
              <div>
                <label htmlFor="pf-new-password" className="text-xs font-semibold text-neutral-300">Password admin baru</label>
                <input id="pf-new-password" type="password" autoComplete="new-password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Minimal 8 karakter" className="mt-1.5 h-11 w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[hsl(var(--brand-accent))]" />
              </div>
              <div>
                <label htmlFor="pf-confirm-password" className="text-xs font-semibold text-neutral-300">Ulangi password</label>
                <input id="pf-confirm-password" type="password" autoComplete="new-password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Ketik ulang password" className="mt-1.5 h-11 w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[hsl(var(--brand-accent))]" />
              </div>
              <button type="submit" disabled={authSubmitting} className="h-11 w-full bg-white hover:bg-neutral-200 disabled:opacity-60 text-black font-bold rounded-xl text-sm transition-all cursor-pointer">{authSubmitting ? 'Menyimpan...' : 'Buat Password & Masuk'}</button>
              <p className="text-[10px] text-neutral-500 leading-relaxed text-center">Password ini kamu buat dan simpan sendiri; password hanya tersimpan sebagai hash aman di database.</p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-3 text-left">
              <div>
                <label htmlFor="pf-password" className="text-xs font-semibold text-neutral-300">Password admin</label>
                <input id="pf-password" type="password" autoComplete="current-password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Masukkan password admin" className="mt-1.5 h-11 w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[hsl(var(--brand-accent))]" />
              </div>
              <button type="submit" disabled={authSubmitting} className="h-11 w-full bg-white hover:bg-neutral-200 disabled:opacity-60 text-black font-bold rounded-xl text-sm transition-all cursor-pointer">{authSubmitting ? 'Memeriksa...' : 'Masuk'}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-900">
          <div>
            <h1 className="text-2xl font-black tracking-tight">PartnerFind Admin Portal</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Pusat kendali pengaturan konten website, live counter, dan countdown.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{currentAdminEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex border-b border-neutral-900 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-3 text-sm font-bold border-b-2 px-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'content' ? 'border-indigo-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>1. Atur Konten Website</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`pb-3 text-sm font-bold border-b-2 px-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'rules' ? 'border-amber-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>2. Angka Live & Countdown</span>
            </button>
            <button
              onClick={() => setActiveTab('inviters')}
              className={`pb-3 text-sm font-bold border-b-2 px-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'inviters' ? 'border-rose-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Megaphone className="w-4 h-4 text-rose-400" />
              <span>3. Testimoni Pengundang</span>
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`pb-3 text-sm font-bold border-b-2 px-4 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'testimonials' ? 'border-amber-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>4. Testimoni Website</span>
            </button>
          </div>

          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
            {activeTab === 'content'
              ? 'Atur gambar website dan link form pendaftaran.'
              : activeTab === 'rules'
                ? 'Pusat kendali aturan live counter dan countdown.'
                : activeTab === 'inviters'
                    ? 'Catat kejadian pengundang yang benar-benar terjadi — bergabung, penarikan imbalan yang sudah dibayar, review asli. Setiap catatan tampil di /referral dan terkirim ke channel Telegram.'
                    : 'Upload foto, nama, dan quote testimoni untuk section testimoni di landing page (di atas CTA). Website menampilkan 3 testimoni terbaru.'}
          </p>

          {activeTab === 'content' && (
            <div className="space-y-8">
              {/* Sub-tabs Filter for Content */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-900">
                <button
                  type="button"
                  onClick={() => setContentSubTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    contentSubTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  Semua Konten
                </button>
                <button
                  type="button"
                  onClick={() => setContentSubTab('images')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    contentSubTab === 'images'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Gambar Website</span>
                </button>
              </div>

              {contentSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{contentSuccessMsg}</span>
                </div>
              )}

              {/* ── BAGIAN 2: GAMBAR WEBSITE ── */}
              {(contentSubTab === 'all' || contentSubTab === 'images') && (
                <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-6">
                  <div className="flex items-center gap-3 border-b border-neutral-800/80 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Gambar Website (Fitur 3 Langkah)</h3>
                      <p className="text-[11px] text-neutral-400">Pilih dari galeri preset, upload file gambar, atau masukkan link URL eksternal</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminImagePicker
                      label="Langkah 1: Temukan Partner"
                      stepNumber={1}
                      value={contentForm.feature1Image || DEFAULT_WEBSITE_CONTENT.feature1Image}
                      defaultValue={DEFAULT_WEBSITE_CONTENT.feature1Image}
                      onChange={(newUrl) => handleContentFieldChange('feature1Image', newUrl)}
                      presets={PRESET_IMAGES}
                      badgeColor="emerald"
                      hint="Gambar ilustrasi untuk pencarian partner / kreator"
                    />

                    <AdminImagePicker
                      label="Langkah 2: Hubungkan Langsung"
                      stepNumber={2}
                      value={contentForm.feature2Image || DEFAULT_WEBSITE_CONTENT.feature2Image}
                      defaultValue={DEFAULT_WEBSITE_CONTENT.feature2Image}
                      onChange={(newUrl) => handleContentFieldChange('feature2Image', newUrl)}
                      presets={PRESET_IMAGES}
                      badgeColor="purple"
                      hint="Gambar ilustrasi koneksi obrolan langsung & kolaborasi"
                    />

                    <AdminImagePicker
                      label="Langkah 3: Kolaborasi & Cuan"
                      stepNumber={3}
                      value={contentForm.feature3Image || DEFAULT_WEBSITE_CONTENT.feature3Image}
                      defaultValue={DEFAULT_WEBSITE_CONTENT.feature3Image}
                      onChange={(newUrl) => handleContentFieldChange('feature3Image', newUrl)}
                      presets={PRESET_IMAGES}
                      badgeColor="indigo"
                      hint="Gambar ilustrasi pertumbuhan revenue & profit"
                    />

                  </div>
                </div>
              )}

              {/* ── BAGIAN 3: LINK FORM PENDAFTARAN ── */}
              <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Type className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Link Form Pendaftaran</h3>
                      <p className="text-[11px] text-neutral-400">Link form yang terbuka saat pengunjung menekan tombol Daftar, per bahasa</p>
                    </div>
                  </div>
                  <select
                    value={activeTextLang}
                    onChange={(e) => setActiveTextLang(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-400"
                  >
                    {SUPPORTED_ADMIN_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                    {/* Tally Embed Form Registration URL per Language */}
                    <div className="space-y-2 p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Link Embed Tally Form Pendaftaran ({SUPPORTED_ADMIN_LANGUAGES.find(l => l.code === activeTextLang)?.label})
                        </label>
                        {getFormTallyUrl() && (
                          <a
                            href={getFormTallyUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                          >
                            <span>Buka Form</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <input
                        type="text"
                        value={getFormTallyUrl()}
                        onChange={(e) => handleFormTallyUrlChange(e.target.value)}
                        placeholder={DEFAULT_TALLY_URLS[activeTextLang] || 'https://tally.so/embed/...'}
                        className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 font-mono"
                      />
                      <p className="text-[10px] text-neutral-500 font-mono">
                        Form Tally ini otomatis dimuat saat pengunjung dengan bahasa{' '}
                        {SUPPORTED_ADMIN_LANGUAGES.find(l => l.code === activeTextLang)?.label} menekan tombol Daftar di Hero & CTA.
                      </p>
                    </div>
              </div>


              {/* Bottom Action Bar for Content */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={handleResetToDefaultContent}
                  disabled={savingContent}
                  className="w-full sm:w-auto px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-neutral-800 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-neutral-400" />
                  <span>Kembalikan ke Default</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSaveAllContent()}
                    disabled={savingContent}
                    className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-neutral-200 text-neutral-950 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98]"
                  >
                    {savingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{savingContent ? 'Menyimpan...' : 'Simpan Semua Konten'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ANGKA LIVE & COUNTDOWN TIMER                           */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'inviters' && (<InvitersTab />)}

          {activeTab === 'testimonials' && (<TestimonialsTab />)}

          {activeTab === 'rules' && (
            <div className="space-y-8">
              {/* Filter Pills for Rules & Numbers */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-900">
                <button
                  type="button"
                  onClick={() => setRulesFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    rulesFilter === 'all'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  Semua Pengaturan
                </button>
                <button
                  type="button"
                  onClick={() => setRulesFilter('hero')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    rulesFilter === 'hero'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Angka Peluang Dibuat</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRulesFilter('countdown')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    rulesFilter === 'countdown'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Countdown Timer</span>
                </button>
              </div>

              {/* ── 1. ANGKA LIVE ANGGOTA (HERO COUNTER) ── */}
              {(rulesFilter === 'all' || rulesFilter === 'hero') && (
                <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Angka Peluang Dibuat (Hero)</h3>
                        <p className="text-[11px] text-neutral-400">Pusat kendali angka peluang dibuat yang ditampilkan di hero</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Live di Web: {Number(counterConfig.currentCount || 1000000).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Manual Override Anggota */}
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                        1. Override Angka Peluang Dibuat Saat Ini
                      </label>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Perbarui langsung ke database
                      </span>
                    </div>
                    
                    <div className="relative w-full">
                      <Users className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inputCurrentCount}
                        onChange={(e) => { memberDirtyRef.current = true; setInputCurrentCount(e.target.value); }}
                        placeholder="Contoh: 1000000"
                        className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono">Angka berjalan naik terus mengikuti aturan di bawah. Ubah isi kolom ini hanya jika ingin memaksa angka ke nilai tertentu, lalu tekan tombol Terapkan di bawah.</p>
                  </div>

                  {/* Aturan Interval Kenaikan Anggota */}
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-4">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                      2. Aturan Kenaikan Otomatis (Interval Penambahan)
                    </label>

                    <form onSubmit={handleApplyAllNumbers} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                            Min Tambah Tiap Interval
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={inputMinIncrement}
                            onChange={(e) => { memberDirtyRef.current = true; setInputMinIncrement(e.target.value); }}
                            className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-xs text-white font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                            Max Tambah Tiap Interval
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={inputMaxIncrement}
                            onChange={(e) => { memberDirtyRef.current = true; setInputMaxIncrement(e.target.value); }}
                            className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-xs text-white font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                            Interval Waktu
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={inputIntervalValue}
                              onChange={(e) => { memberDirtyRef.current = true; setInputIntervalValue(e.target.value); }}
                              className="w-1/2 h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-xs text-white font-mono font-medium"
                            />
                            <select
                              value={inputIntervalUnit}
                              onChange={(e) => { memberDirtyRef.current = true; setInputIntervalUnit(e.target.value as 'seconds' | 'minutes'); }}
                              className="w-1/2 h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-2 text-xs text-white font-mono"
                            >
                              <option value="seconds">Detik</option>
                              <option value="minutes">Menit</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ── TOMBOL TERAPKAN SEMUA ANGKA ── */}
              {(rulesFilter === 'all' || rulesFilter === 'hero' || rulesFilter === 'group') && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleApplyAllNumbers()}
                    disabled={applyingNumbers}
                    className="w-full sm:w-auto px-6 h-12 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-neutral-950 font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    {applyingNumbers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Terapkan Semua Pengaturan Angka</span>
                  </button>
                  {numbersMsg && (
                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{numbersMsg}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ── 3. COUNTDOWN TIMER & ANNOUNCEMENT BAR ── */}
              {(rulesFilter === 'all' || rulesFilter === 'countdown') && (
                <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Pengaturan Countdown Timer</h3>
                        <p className="text-[11px] text-neutral-400">Atur target waktu berakhirnya hitung mundur pencocokan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { announcementDirtyRef.current = true; setAnnouncementEnabled(!announcementEnabled); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                          announcementEnabled
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {announcementEnabled ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{announcementEnabled ? 'Countdown Aktif' : 'Countdown Disembunyikan'}</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAnnouncement} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5 font-mono">
                          Target Tanggal & Jam Berakhir
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={announcementTargetDate}
                            onChange={(e) => { announcementDirtyRef.current = true; setAnnouncementTargetDate(e.target.value); }}
                            className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                          Format waktu lokal Anda. Hitungan mundur berjalan otomatis di browser pengguna.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5 font-mono">
                          Siklus Auto-Roll (Hari)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={announcementAutoRoll}
                          onChange={(e) => { announcementDirtyRef.current = true; setAnnouncementAutoRoll(parseInt(e.target.value, 10) || 0); }}
                          placeholder="0 (Tetap berakhir) atau 3 (Roll 3 hari)"
                          className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                          Isi 0 jika tanggal tetap; isi &gt; 0 agar waktu otomatis diperpanjang jika telah habis.
                        </p>
                      </div>
                    </div>

                    {/* Preview Box Countdown */}
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Timer className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Hitung Mundur Pencocokan
                          </p>
                          <p className="text-[11px] text-neutral-500 font-mono">
                            Target: {announcementTargetDate ? new Date(announcementTargetDate).toLocaleString('id-ID') : 'Belum diatur'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-center font-mono">
                        <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                          <span className="text-xs font-bold text-amber-400">Target</span>
                          <span className="block text-[10px] text-neutral-500">SET</span>
                        </div>
                        <span className="text-neutral-500 font-bold">:</span>
                        <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                          <span className="text-xs font-bold text-white">{announcementEnabled ? 'AKTIF' : 'OFF'}</span>
                          <span className="block text-[10px] text-neutral-500">STATUS</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="submit"
                        disabled={savingAnnouncement}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-[0.98]"
                      >
                        {savingAnnouncement ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Simpan Pengaturan Countdown</span>
                      </button>
                      {announcementSuccessMsg && (
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{announcementSuccessMsg}</span>
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
