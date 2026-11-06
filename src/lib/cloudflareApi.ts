export async function apiRequest<T = any>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers || {}) };
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (import.meta.env.VITE_LOCAL_ADMIN_BYPASS === "true") headers["x-local-admin"] = "true";
  const response = await fetch(path, {
    method: init.method || (init.body === undefined ? "GET" : "POST"),
    headers,
    credentials: "same-origin",
    cache: "no-store",
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  let result: any = null;
  try { result = await response.json(); } catch {}
  if (!response.ok) throw new Error(result?.error || `Permintaan gagal (${response.status}).`);
  return result as T;
}

export function subscribeJson<T>(
  path: string,
  callback: (value: T) => void,
  fallback?: T,
  intervalMs = 5000,
): () => void {
  let stopped = false;
  let pending = false;
  const refresh = async () => {
    if (stopped || pending) return;
    pending = true;
    try {
      const value = await apiRequest<T>(path);
      if (!stopped) callback(value);
    } catch (error) {
      console.warn(`Cloudflare API polling warning (${path}):`, error);
      if (!stopped && fallback !== undefined) callback(fallback);
    } finally { pending = false; }
  };
  void refresh();
  const timer = window.setInterval(refresh, Math.max(1500, intervalMs));
  return () => { stopped = true; window.clearInterval(timer); };
}
