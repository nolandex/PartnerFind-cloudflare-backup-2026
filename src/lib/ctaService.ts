import { subscribeJson } from "./cloudflareApi";

export interface CtaConfig {
  enabled: boolean;
  updatedAt?: number;
  updatedBy?: string;
}
const SETTINGS_ID = "cta_config";
const LOCAL_STORAGE_KEY = "collab_cta_settings_v1";
const DEFAULT_CTA_CONFIG: CtaConfig = { enabled: false };

export function getCachedCtaEnabled(): boolean {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "null");
    return typeof parsed?.enabled === "boolean" ? parsed.enabled : DEFAULT_CTA_CONFIG.enabled;
  } catch { return DEFAULT_CTA_CONFIG.enabled; }
}
export function subscribeCtaConfig(callback: (config: CtaConfig) => void): () => void {
  return subscribeJson(`/api/settings/${SETTINGS_ID}`, (raw) => {
    const config = { ...DEFAULT_CTA_CONFIG, ...(raw || {}) };
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config)); } catch {}
    callback(config);
  }, DEFAULT_CTA_CONFIG);
}
