import { subscribeJson } from "./cloudflareApi";

export interface VideoEmbedConfig {
  enabled: boolean;
  youtubeVideoId?: string;
  perLocale?: Record<string, string>;
  updatedAt?: number;
  updatedBy?: string;
}
const SETTINGS_ID = "video_config";
const LOCAL_STORAGE_KEY = "collab_video_settings_v1";
const DEFAULT_VIDEO_CONFIG: VideoEmbedConfig = {
  enabled: true,
  youtubeVideoId: "4dXRsOKTvqY",
  perLocale: {
    "en-US": "z59aWbH0zEQ",
    "es-ES": "MVtEOD-Freo",
    "fr-FR": "5q7-_dmIVJw",
    "ja-JP": "t-jSOCijaCw",
    "id-ID": "4dXRsOKTvqY",
    "ar-SA": "5p997wUCxws",
    "ko-KR": "weGrGrkZrz0",
    "pt-PT": "83ZyfBOG3_s",
    "ru-RU": "Yhg7pb_NjNE",
    "zh-CN": "vcFRIOqXRI4",
  },
};
export function getVideoIdForLocale(config: VideoEmbedConfig, locale: string): string {
  return config.perLocale?.[locale] || config.youtubeVideoId || DEFAULT_VIDEO_CONFIG.youtubeVideoId || "4dXRsOKTvqY";
}

export function getCachedVideoConfig(): VideoEmbedConfig {
  try { return { ...DEFAULT_VIDEO_CONFIG, ...JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "null") }; }
  catch { return DEFAULT_VIDEO_CONFIG; }
}
export function subscribeVideoConfig(callback: (config: VideoEmbedConfig) => void): () => void {
  return subscribeJson(`/api/settings/${SETTINGS_ID}`, (raw) => {
    const config = { ...DEFAULT_VIDEO_CONFIG, ...(raw || {}) };
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config)); } catch {}
    callback(config);
  }, DEFAULT_VIDEO_CONFIG);
}
