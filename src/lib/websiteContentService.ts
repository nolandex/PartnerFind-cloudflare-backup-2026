import { apiRequest, subscribeJson } from "./cloudflareApi";

export interface WebsiteContentConfig {
  videoEnabled: boolean; youtubeVideoId: string; videoTitle: string;
  feature1Image: string; feature2Image: string; feature3Image: string; ctaBannerImage?: string;
  heroHeadline: string; heroSubheadline: string; searchPlaceholder: string; countdownTitle: string;
  featuresLabel: string; feature1Title: string; feature1Desc: string; feature2Title: string; feature2Desc: string; feature3Title: string; feature3Desc: string;
  ctaSubheadline: string; ctaButtonText: string; footerCopyright: string;
  texts?: Record<string, Record<string, string>>; tallyEmbedUrls?: Record<string, string>; updatedAt?: number; updatedBy?: string;
}
export function getLocalizedText(config: WebsiteContentConfig, locale: string, field: string, defaultTranslationValue: string): string {
  const localized = config.texts?.[locale]?.[field];
  if (typeof localized === "string" && localized.trim()) return localized;
  if ((locale === "id-ID" || !locale) && (config as any)[field]) {
    const legacy = (config as any)[field];
    if (typeof legacy === "string" && legacy.trim()) return legacy;
  }
  return defaultTranslationValue;
}
export const PRESET_IMAGES: { label: string; url: string }[] = [];
export const DEFAULT_WEBSITE_CONTENT: WebsiteContentConfig = {
  videoEnabled: true, youtubeVideoId: "", videoTitle: "PartnerFind Platform Overview",
  feature1Image: "", feature2Image: "", feature3Image: "", ctaBannerImage: "",
  heroHeadline: "", heroSubheadline: "", searchPlaceholder: "Temukan kolaborasi...", countdownTitle: "",
  featuresLabel: "", feature1Title: "", feature1Desc: "", feature2Title: "", feature2Desc: "", feature3Title: "", feature3Desc: "",
  ctaSubheadline: "", ctaButtonText: "", footerCopyright: "",
};
const SETTINGS_DOC_ID = "website_content";
const LOCAL_STORAGE_KEY = "partnerfind_website_content_v1";
export function extractYoutubeId(input: string): string {
  if (!input) return "4dXRsOKTvqY";
  const trimmed = input.trim();
  const short = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,15})/); if (short?.[1]) return short[1];
  const watch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,15})/); if (watch?.[1]) return watch[1];
  const embed = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{6,15})/); if (embed?.[1]) return embed[1];
  return /^[a-zA-Z0-9_-]{6,15}$/.test(trimmed) ? trimmed : trimmed;
}
function sanitizeContentConfig(raw: Partial<WebsiteContentConfig>): WebsiteContentConfig {
  const merged: WebsiteContentConfig = { ...DEFAULT_WEBSITE_CONTENT, ...raw };
  const invalid = (url?: string) => !url || typeof url !== "string" || !url.trim() || /(?:\/assets\/|\/src\/assets\/images\/)collab_[^/?#]+\.(?:jpg|png|webp)(?:[?#]|$)/i.test(url.trim()) || url.includes("photo-1517248135467-4c7edcad34c4") || url.includes("photo-1513104890138-7c749659a591") || url.startsWith("/uploads/1000822289_1793193739965");
  if (invalid(merged.feature1Image)) merged.feature1Image = DEFAULT_WEBSITE_CONTENT.feature1Image;
  if (invalid(merged.feature2Image)) merged.feature2Image = DEFAULT_WEBSITE_CONTENT.feature2Image;
  if (invalid(merged.feature3Image)) merged.feature3Image = DEFAULT_WEBSITE_CONTENT.feature3Image;
  if (merged.ctaBannerImage && (merged.ctaBannerImage.startsWith("/uploads/1000816816_1792130055019") || !merged.ctaBannerImage.trim())) merged.ctaBannerImage = "";
  return merged;
}
export function getCachedWebsiteContent(): WebsiteContentConfig {
  try { const raw = localStorage.getItem(LOCAL_STORAGE_KEY); return raw !== null ? sanitizeContentConfig(JSON.parse(raw)) : DEFAULT_WEBSITE_CONTENT; }
  catch { return DEFAULT_WEBSITE_CONTENT; }
}
export async function saveWebsiteContent(updates: Partial<WebsiteContentConfig>, userEmail = "admin"): Promise<boolean> {
  const payload = sanitizeContentConfig({ ...getCachedWebsiteContent(), ...updates, updatedAt: Date.now(), updatedBy: userEmail });
  try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload)); } catch {}
  try {
    await apiRequest(`/api/admin/settings/${SETTINGS_DOC_ID}`, { method: "PUT", body: payload });
    return true;
  } catch (error) { console.error("Error saving website content to Cloudflare:", error); return false; }
}
export function subscribeWebsiteContent(callback: (config: WebsiteContentConfig) => void): () => void {
  return subscribeJson(`/api/settings/${SETTINGS_DOC_ID}`, (raw) => {
    const config = sanitizeContentConfig(raw || {});
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config)); } catch {}
    callback(config);
  }, DEFAULT_WEBSITE_CONTENT);
}
