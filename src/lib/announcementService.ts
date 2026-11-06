import { apiRequest, subscribeJson } from "./cloudflareApi";

export interface AnnouncementBarConfig {
  enabled: boolean;
  badgeText: string;
  message: string;
  messageEn?: string;
  targetDate: string;
  buttonText: string;
  buttonTextEn?: string;
  buttonLink: string;
  theme?: "accent" | "amber" | "emerald" | "crimson" | "indigo";
  allowDismiss?: boolean;
  autoRollDays?: number;
  updatedAt?: number;
  updatedBy?: string;
}
const SETTINGS_DOC_ID = "announcement_bar";
const LOCAL_STORAGE_ANNOUNCEMENT_KEY = "collab_announcement_bar_config_v2";
const DEFAULT_TARGET_DATE = "2026-10-01T00:00:00.000Z";
export const DEFAULT_ANNOUNCEMENT: AnnouncementBarConfig = {
  enabled: true, badgeText: "", message: "Pra Registrasi ditutup dalam", messageEn: "Pre-registration Closes In",
  targetDate: DEFAULT_TARGET_DATE, buttonText: "", buttonTextEn: "", buttonLink: "", theme: "accent", allowDismiss: false, autoRollDays: 0,
};
export function normalizeTargetDate(targetDateStr?: string, autoRollDays = 0): string {
  if (!targetDateStr) return DEFAULT_TARGET_DATE;
  try {
    const targetMs = new Date(targetDateStr).getTime();
    if (Number.isNaN(targetMs)) return DEFAULT_TARGET_DATE;
    const nowMs = Date.now();
    if (autoRollDays > 0 && targetMs < nowMs) {
      const cycleMs = autoRollDays * 86400000;
      return new Date(targetMs + Math.ceil((nowMs - targetMs) / cycleMs) * cycleMs).toISOString();
    }
    return targetDateStr;
  } catch { return DEFAULT_TARGET_DATE; }
}
export function getCachedAnnouncement(): AnnouncementBarConfig {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ANNOUNCEMENT_KEY) || "null");
    return parsed ? { ...DEFAULT_ANNOUNCEMENT, ...parsed, targetDate: normalizeTargetDate(parsed.targetDate || DEFAULT_TARGET_DATE, parsed.autoRollDays || 0) } : DEFAULT_ANNOUNCEMENT;
  } catch { return DEFAULT_ANNOUNCEMENT; }
}
export async function saveAnnouncementConfig(config: Partial<AnnouncementBarConfig>): Promise<boolean> {
  const updated = { ...getCachedAnnouncement(), ...config, updatedAt: Date.now() };
  try {
    await apiRequest(`/api/admin/settings/${SETTINGS_DOC_ID}`, { method: "PUT", body: updated });
    try { localStorage.setItem(LOCAL_STORAGE_ANNOUNCEMENT_KEY, JSON.stringify(updated)); } catch {}
    return true;
  } catch (error) { console.error("Error saving announcement config:", error); return false; }
}
export function subscribeAnnouncement(callback: (config: AnnouncementBarConfig) => void): () => void {
  return subscribeJson(`/api/settings/${SETTINGS_DOC_ID}`, (data) => {
    const normalized = { ...DEFAULT_ANNOUNCEMENT, ...(data || {}), targetDate: normalizeTargetDate(data?.targetDate || DEFAULT_TARGET_DATE, data?.autoRollDays || 0) };
    try { localStorage.setItem(LOCAL_STORAGE_ANNOUNCEMENT_KEY, JSON.stringify(normalized)); } catch {}
    callback(normalized);
  }, DEFAULT_ANNOUNCEMENT);
}
