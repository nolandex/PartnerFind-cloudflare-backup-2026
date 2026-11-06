import { apiRequest, subscribeJson } from "./cloudflareApi";

export interface HeroCounterConfig {
  currentCount: number; minIncrement: number; maxIncrement: number; intervalValue?: number; intervalUnit?: "seconds" | "minutes"; intervalMinutes: number; lastUpdated: number;
  groupCount: number; groupMinIncrement: number; groupMaxIncrement: number; groupIntervalValue?: number; groupIntervalUnit?: "seconds" | "minutes"; groupIntervalMinutes: number; groupLastUpdated: number;
}
export const DEFAULT_HERO_COUNTER: HeroCounterConfig = {
  currentCount: 1000000, minIncrement: 1, maxIncrement: 3, intervalValue: 1, intervalUnit: "minutes", intervalMinutes: 1, lastUpdated: Date.now(),
  groupCount: 342180, groupMinIncrement: 1, groupMaxIncrement: 2, groupIntervalValue: 2, groupIntervalUnit: "minutes", groupIntervalMinutes: 2, groupLastUpdated: Date.now(),
};
const MEMBER_KEY = "last_hero_member_count";
const GROUP_KEY = "last_hero_group_count";
let latestConfigCache: HeroCounterConfig | null = null;
const numberFrom = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
function getIntervalMs(unit?: "seconds" | "minutes", value?: number, fallbackMinutes?: number): number {
  return unit === "seconds" ? Math.max(1, value || 1) * 1000 : Math.max(0.01, value || fallbackMinutes || 1) * 60000;
}
export function getCachedHeroCount(): number {
  // Placeholder only until the first server value arrives; the server is the
  // single source of truth (an admin may legitimately set any value).
  return DEFAULT_HERO_COUNTER.currentCount;
}
export function getCachedGroupCount(): number {
  return DEFAULT_HERO_COUNTER.groupCount;
}
function normalize(raw: Partial<HeroCounterConfig>): HeroCounterConfig {
  return {
    currentCount: numberFrom(raw.currentCount, DEFAULT_HERO_COUNTER.currentCount),
    minIncrement: numberFrom(raw.minIncrement, DEFAULT_HERO_COUNTER.minIncrement), maxIncrement: numberFrom(raw.maxIncrement, DEFAULT_HERO_COUNTER.maxIncrement),
    intervalValue: numberFrom(raw.intervalValue, raw.intervalMinutes || 1), intervalUnit: raw.intervalUnit || (raw.intervalMinutes && raw.intervalMinutes < 1 ? "seconds" : "minutes"),
    intervalMinutes: numberFrom(raw.intervalMinutes, 1), lastUpdated: numberFrom(raw.lastUpdated, Date.now()),
    groupCount: numberFrom(raw.groupCount, DEFAULT_HERO_COUNTER.groupCount),
    groupMinIncrement: numberFrom(raw.groupMinIncrement, DEFAULT_HERO_COUNTER.groupMinIncrement), groupMaxIncrement: numberFrom(raw.groupMaxIncrement, DEFAULT_HERO_COUNTER.groupMaxIncrement),
    groupIntervalValue: numberFrom(raw.groupIntervalValue, raw.groupIntervalMinutes || 2), groupIntervalUnit: raw.groupIntervalUnit || (raw.groupIntervalMinutes && raw.groupIntervalMinutes < 1 ? "seconds" : "minutes"),
    groupIntervalMinutes: numberFrom(raw.groupIntervalMinutes, 2), groupLastUpdated: numberFrom(raw.groupLastUpdated, Date.now()),
  };
}
function cache(config: HeroCounterConfig): void {
  latestConfigCache = config;
  try { localStorage.setItem(MEMBER_KEY, String(config.currentCount)); localStorage.setItem(GROUP_KEY, String(config.groupCount)); } catch {}
}
async function getHeroCounterConfig(): Promise<HeroCounterConfig> {
  try { const config = normalize(await apiRequest<Partial<HeroCounterConfig>>("/api/settings/hero_counter")); cache(config); return config; }
  catch (err) { console.warn("Error fetching hero counter from Cloudflare:", err); return latestConfigCache || normalize({}); }
}
async function savePatch(payload: Partial<HeroCounterConfig>): Promise<boolean> {
  try { const saved = await apiRequest<{ data?: Partial<HeroCounterConfig> }>("/api/admin/settings/hero_counter", { method: "PUT", body: payload }); cache(normalize(saved.data || { ...latestConfigCache, ...payload })); return true; }
  catch (err) { console.error("Error saving hero counter:", err); return false; }
}
export async function saveHeroRulesConfig(rules: { minIncrement: number; maxIncrement: number; intervalValue: number; intervalUnit: "seconds" | "minutes"; intervalMinutes?: number; currentCount?: number; overrideCount?: boolean }): Promise<boolean> {
  const minIncrement = Math.max(1, Math.round(rules.minIncrement));
  const maxIncrement = Math.max(minIncrement, Math.round(rules.maxIncrement));
  const intervalValue = Math.max(1, Math.round(rules.intervalValue) || 1);
  const intervalUnit = rules.intervalUnit === "seconds" ? "seconds" : "minutes";
  const payload: Partial<HeroCounterConfig> = { minIncrement, maxIncrement, intervalValue, intervalUnit, intervalMinutes: intervalUnit === "seconds" ? intervalValue / 60 : intervalValue };
  if (rules.overrideCount && typeof rules.currentCount === "number" && Number.isFinite(rules.currentCount) && rules.currentCount >= 0) {
    payload.currentCount = Math.round(rules.currentCount); payload.lastUpdated = Date.now();
  }
  return savePatch(payload);
}
export async function overrideHeroCount(newCount: number): Promise<boolean> {
  return savePatch({ currentCount: Math.max(0, Math.round(newCount)), lastUpdated: Date.now() });
}
export async function saveGroupRulesConfig(rules: { groupMinIncrement: number; groupMaxIncrement: number; groupIntervalValue: number; groupIntervalUnit: "seconds" | "minutes"; groupIntervalMinutes?: number; groupCount?: number; overrideCount?: boolean }): Promise<boolean> {
  const groupMinIncrement = Math.max(1, Math.round(rules.groupMinIncrement));
  const groupMaxIncrement = Math.max(groupMinIncrement, Math.round(rules.groupMaxIncrement));
  const groupIntervalValue = Math.max(1, Math.round(rules.groupIntervalValue) || 1);
  const groupIntervalUnit = rules.groupIntervalUnit === "seconds" ? "seconds" : "minutes";
  const payload: Partial<HeroCounterConfig> = { groupMinIncrement, groupMaxIncrement, groupIntervalValue, groupIntervalUnit, groupIntervalMinutes: groupIntervalUnit === "seconds" ? groupIntervalValue / 60 : groupIntervalValue };
  if (rules.overrideCount && typeof rules.groupCount === "number" && Number.isFinite(rules.groupCount) && rules.groupCount >= 0) { payload.groupCount = Math.round(rules.groupCount); payload.groupLastUpdated = Date.now(); }
  return savePatch(payload);
}
export async function overrideGroupCount(newCount: number): Promise<boolean> {
  return savePatch({ groupCount: Math.max(0, Math.round(newCount)), groupLastUpdated: Date.now() });
}
async function checkAndAdvanceCounter(): Promise<void> {
  const config = latestConfigCache;
  if (config) {
    const now = Date.now();
    if (now - config.lastUpdated < getIntervalMs(config.intervalUnit, config.intervalValue, config.intervalMinutes) && now - config.groupLastUpdated < getIntervalMs(config.groupIntervalUnit, config.groupIntervalValue, config.groupIntervalMinutes)) return;
  }
  await getHeroCounterConfig();
}
export function subscribeHeroCounter(callback: (config: HeroCounterConfig) => void): () => void {
  const unsubscribe = subscribeJson<Partial<HeroCounterConfig>>("/api/settings/hero_counter", (raw) => {
    const config = normalize(raw || {}); cache(config); callback(config);
  }, DEFAULT_HERO_COUNTER, 10000);
  const ticker = window.setInterval(() => { void checkAndAdvanceCounter(); }, 1000);
  return () => { unsubscribe(); window.clearInterval(ticker); };
}
