import { Locale } from "./translations";

export interface LanguageOption {
  locale: Locale;
  name: string;
  flag: string;
  short: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { locale: "en-US", name: "English", flag: "🇺🇸", short: "EN" },
  { locale: "zh-CN", name: "中文", flag: "🇨🇳", short: "ZH" },
  { locale: "es-ES", name: "Español", flag: "🇪🇸", short: "ES" },
  { locale: "id-ID", name: "Indonesia", flag: "🇮🇩", short: "ID" },
  { locale: "ja-JP", name: "日本語", flag: "🇯🇵", short: "JA" },
  { locale: "fr-FR", name: "Français", flag: "🇫🇷", short: "FR" },
  { locale: "ar-SA", name: "العربية", flag: "🇸🇦", short: "AR" },
  { locale: "ru-RU", name: "Русский", flag: "🇷🇺", short: "RU" },
  { locale: "ko-KR", name: "한국어", flag: "🇰🇷", short: "KO" },
  { locale: "pt-PT", name: "Português", flag: "🇵🇹", short: "PT" },
];
