// @ts-nocheck
// Admin authentication uses a single admin password (PBKDF2 hash stored in D1
// under the internal settings id "admin_auth", which is never exposed through
// the public settings endpoints) plus an HMAC-signed session cookie.
const AUTH_SETTING_ID = "admin_auth";
const LOGIN_GUARD_ID = "admin_login_guard";
const LOGIN_MAX_FAILS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const SESSION_COOKIE = "pf_admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 3600;
const PBKDF2_ITERATIONS = 100000;
const SETTINGS_IDS = new Set([
  "announcement_bar",
  "cta_config",
  "video_config",
  "website_content",
  "hero_counter",
]);
const DEFAULT_HERO = {
  currentCount: 1000000, minIncrement: 1, maxIncrement: 3,
  intervalValue: 1, intervalUnit: "minutes", intervalMinutes: 1,
  lastUpdated: Date.now(), groupCount: 342180, groupMinIncrement: 1,
  groupMaxIncrement: 2, groupIntervalValue: 2, groupIntervalUnit: "minutes",
  groupIntervalMinutes: 2, groupLastUpdated: Date.now(),
};
const json = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extraHeaders },
});
const fail = (message, status = 400) => json({ error: message }, status);
const nowIso = () => new Date().toISOString();
const parseJson = async (request, maxBytes = 2_000_000) => {
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("Ukuran permintaan terlalu besar.");
  try { return JSON.parse(text || "{}"); } catch { throw new Error("Format JSON tidak valid."); }
};
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const unb64url = (text) => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - text.length % 4) % 4)), c => c.charCodeAt(0));

const timingSafeEqual = (a, b) => {
  const sa = String(a || ""); const sb = String(b || "");
  let diff = sa.length ^ sb.length;
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) diff |= (sa.charCodeAt(i) || 0) ^ (sb.charCodeAt(i) || 0);
  return diff === 0;
};
async function hashPassword(password, saltB64, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: unb64url(saltB64), iterations, hash: "SHA-256" }, key, 256);
  return b64url(bits);
}
async function getLoginGuard(env) {
  const row = await env.DB.prepare("SELECT data FROM settings WHERE id = ?").bind(LOGIN_GUARD_ID).first();
  if (!row) return { fails: 0, windowStart: 0, lockedUntil: 0 };
  try { const g = JSON.parse(row.data); return { fails: Number(g.fails) || 0, windowStart: Number(g.windowStart) || 0, lockedUntil: Number(g.lockedUntil) || 0 }; } catch { return { fails: 0, windowStart: 0, lockedUntil: 0 }; }
}
async function getAdminAuth(env) {
  const row = await env.DB.prepare("SELECT data FROM settings WHERE id = ?").bind(AUTH_SETTING_ID).first();
  if (!row) return null;
  try { const auth = JSON.parse(row.data); return auth && auth.hash && auth.salt ? auth : null; } catch { return null; }
}
async function hmacSign(auth, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${auth.hash}.${auth.salt}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text)));
}
async function makeSessionToken(auth) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 })));
  return `${payload}.${await hmacSign(auth, payload)}`;
}
async function verifySessionToken(auth, token) {
  if (!auth || !token || typeof token !== "string") return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!timingSafeEqual(signature, await hmacSign(auth, payload))) return false;
  try {
    const claims = JSON.parse(new TextDecoder().decode(unb64url(payload)));
    return Number.isFinite(claims.exp) && claims.exp > Date.now();
  } catch { return false; }
}
const sessionCookie = (token, maxAgeSeconds) => `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
const readCookie = (request, name) => {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
};

async function requireAdmin(request, env) {
  // This bypass exists only in the explicit local Wrangler dev environment.
  if (env.ENVIRONMENT === "development" && env.LOCAL_ADMIN_BYPASS === "true") {
    const host = new URL(request.url).hostname;
    if (["localhost", "127.0.0.1", "::1"].includes(host) && request.headers.get("x-local-admin") === "true") return { email: "Admin (lokal)" };
  }
  const auth = await getAdminAuth(env);
  if (!auth) return null;
  return (await verifySessionToken(auth, readCookie(request, SESSION_COOKIE))) ? { email: "Admin" } : null;
}
async function readSetting(env, id) {
  const row = await env.DB.prepare("SELECT data FROM settings WHERE id = ?").bind(id).first();
  return row ? JSON.parse(row.data) : null;
}
async function writeSetting(env, id, data) {
  await env.DB.prepare("INSERT INTO settings(id,data,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at")
    .bind(id, JSON.stringify(data), Date.now()).run();
}
// Section images live inside website_content as data URIs (~150 KB of JSON).
// For public visitors they are exposed as cacheable file URLs instead, so the
// settings JSON stays tiny and each image is cached on its own. The URL
// carries a content hash, so an admin image change produces a fresh URL.
// Admin browsers (session cookie) keep receiving the raw data URIs so the
// admin panel's image editor and its saves are unaffected.
const IMAGE_FIELDS = new Set(["feature1Image", "feature2Image", "feature3Image", "ctaBannerImage", "feature1Image_id-ID", "feature1Image_en-US", "feature1Image_es-ES", "feature1Image_ja-JP", "feature1Image_fr-FR", "feature1Image_ar-SA", "feature1Image_ru-RU", "feature1Image_ko-KR", "feature1Image_pt-PT", "feature1Image_zh-CN"]);
const hashString = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};
const slimWebsiteContent = (data) => {
  if (!data || typeof data !== "object") return data;
  const out = { ...data };
  for (const field of IMAGE_FIELDS) {
    const value = out[field];
    if (typeof value === "string" && value.startsWith("data:image/")) {
      out[field] = `/api/img/${field}?v=${hashString(value)}`;
    }
  }
  return out;
};
const base64ToBytes = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};
const intervalMs = (unit, value, fallback = 1) => unit === "seconds" ? Math.max(1, Number(value) || 1) * 1000 : Math.max(0.01, Number(value) || fallback) * 60000;
async function getAndAdvanceHero(env) {
  let row = await env.DB.prepare("SELECT data,updated_at FROM settings WHERE id='hero_counter'").first();
  let cfg;
  if (!row) {
    const initial = { ...DEFAULT_HERO, lastUpdated: Date.now(), groupLastUpdated: Date.now() };
    await env.DB.prepare("INSERT OR IGNORE INTO settings(id,data,updated_at) VALUES(?,?,?)").bind("hero_counter", JSON.stringify(initial), Date.now()).run();
    row = await env.DB.prepare("SELECT data,updated_at FROM settings WHERE id='hero_counter'").first();
  }
  cfg = row ? JSON.parse(row.data) : { ...DEFAULT_HERO };
  const originalData = row?.data || "";
  const oldMember = Number(cfg.lastUpdated) || Date.now();
  const oldGroup = Number(cfg.groupLastUpdated) || oldMember;
  const mMs = intervalMs(cfg.intervalUnit, cfg.intervalValue, cfg.intervalMinutes || 1);
  const gMs = intervalMs(cfg.groupIntervalUnit, cfg.groupIntervalValue, cfg.groupIntervalMinutes || 2);
  const mSteps = Math.min(100, Math.floor(Math.max(0, Date.now() - oldMember) / mMs));
  const gSteps = Math.min(100, Math.floor(Math.max(0, Date.now() - oldGroup) / gMs));
  if (mSteps || gSteps) {
    const next = { ...cfg };
    const randTotal = (n, min, max) => { let total = 0; for (let i = 0; i < n; i++) total += Math.floor(Math.random() * (Math.max(min, max) - Math.max(1, min) + 1)) + Math.max(1, min); return total; };
    if (mSteps) {
      // Respect the stored count exactly (an admin may set any value on
      // purpose); only fall back to the default when it is missing/invalid.
      const baseMember = Number.isFinite(Number(cfg.currentCount)) ? Number(cfg.currentCount) : DEFAULT_HERO.currentCount;
      next.currentCount = baseMember + randTotal(mSteps, Number(cfg.minIncrement) || 1, Number(cfg.maxIncrement) || 3);
      next.lastUpdated = oldMember + mSteps * mMs;
    }
    if (gSteps) {
      const baseGroup = Number.isFinite(Number(cfg.groupCount)) ? Number(cfg.groupCount) : DEFAULT_HERO.groupCount;
      next.groupCount = baseGroup + randTotal(gSteps, Number(cfg.groupMinIncrement) || 1, Number(cfg.groupMaxIncrement) || 2);
      next.groupLastUpdated = oldGroup + gSteps * gMs;
    }
    // Optimistic compare-and-swap prevents two visitors from applying the same interval twice.
    const result = await env.DB.prepare("UPDATE settings SET data=?,updated_at=? WHERE id='hero_counter' AND data=?")
      .bind(JSON.stringify(next), Date.now(), originalData).run();
    cfg = result.meta?.changes ? next : (await readSetting(env, "hero_counter") || next);
  }
  return cfg;
}

async function notifyChannel(env, text) {
  // Kirim pesan ke channel Telegram lewat bot Worker (endpoint /notify
  // ber-secret bersama). Hanya untuk kejadian ASLI yang dicatat admin.
  try {
    if (!env.NOTIFY_SECRET) return;
    await fetch("https://partnerfind-bot.partnerfind.workers.dev/notify", {
      method: "POST",
      headers: { "content-type": "application/json", "x-notify-secret": env.NOTIFY_SECRET },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.log("notif channel gagal:", String(e));
  }
}
async function handleMatching(request, env, path, method) {
  if (path.startsWith("/api/admin/inviter-events") || path.startsWith("/api/admin/testimonials")) {
    const admin = await requireAdmin(request, env);
    if (!admin) return fail("Akses admin diperlukan.", 401);
    if (path === "/api/admin/inviter-events" && method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM inviter_events ORDER BY id DESC LIMIT 200").all();
      return json({ data: results || [] });
    }
    if (path === "/api/admin/inviter-events" && method === "POST") {
      const body = await parseJson(request);
      const type = String(body?.type || "");
      const TYPES = ["join", "withdraw", "review_short", "review_medium", "review_long"];
      if (!TYPES.includes(type)) return fail("Jenis testimoni tidak valid.");
      const name = String(body?.name || "").trim().slice(0, 100);
      if (!name) return fail("Nama pengundang wajib diisi.");
      let amount = null;
      let text = null;
      if (type === "withdraw") {
        amount = Math.floor(Number(body?.amount));
        if (!amount || amount <= 0) return fail("Nominal penarikan wajib diisi dan lebih dari 0.");
      }
      if (type.startsWith("review")) {
        const cap = type === "review_short" ? 200 : type === "review_medium" ? 500 : 1200;
        text = String(body?.text || "").trim().slice(0, cap);
        if (!text) return fail("Isi review wajib diisi.");
      }
      const res = await env.DB.prepare("INSERT INTO inviter_events(type,name,amount,text) VALUES(?,?,?,?)").bind(type, name, amount, text).run();
      const rp = amount ? amount.toLocaleString("id-ID") : "";
      const msg =
        type === "join"
          ? `\u{1F389} Pengundang baru bergabung di PartnerFind!\n${name} baru saja bergabung sebagai pengundang.\n\nIkut bergabung: https://partnerfind.ai.id/pengundang`
          : type === "withdraw"
            ? `\u{1F4B8} Imbalan pengundang cair!\n${name} telah menarik imbalan sebesar Rp${rp}.\n\nJadi pengundang juga: https://partnerfind.ai.id/pengundang`
            : `\u{2B50} Review pengundang PartnerFind\n\u{201C}${text}\u{201D}\n\u{2014} ${name}\n\nhttps://partnerfind.ai.id/pengundang`;
      await notifyChannel(env, msg);
      return json({ success: true, id: res?.meta?.last_row_id ?? null });
    }
    if (path === "/api/admin/inviter-events/import" && method === "POST") {
      // Impor massal catatan pengundang ASLI (mis. kejadian seharian yang
      // dicatat dulu lalu dimasukkan sekaligus). Maks 500 baris per impor.
      // Semua tampil di website; ke channel terkirim SATU ringkasan agar
      // channel tidak kebanjiran ratusan postingan sekaligus.
      const body = await parseJson(request);
      const items = Array.isArray(body?.items) ? body.items.slice(0, 500) : [];
      const TYPES = ["join", "withdraw", "review_short", "review_medium", "review_long"];
      let inserted = 0, skipped = 0;
      for (const raw of items) {
        const type = String(raw?.type || "");
        const name = String(raw?.name || "").trim().slice(0, 100);
        if (!TYPES.includes(type) || !name) { skipped++; continue; }
        let amount = null, text = null, ok = true;
        if (type === "withdraw") {
          amount = Math.floor(Number(raw?.amount));
          if (!amount || amount <= 0) ok = false;
        }
        if (type.startsWith("review")) {
          const cap = type === "review_short" ? 200 : type === "review_medium" ? 500 : 1200;
          text = String(raw?.text || "").trim().slice(0, cap);
          if (!text) ok = false;
        }
        if (!ok) { skipped++; continue; }
        await env.DB.prepare("INSERT INTO inviter_events(type,name,amount,text) VALUES(?,?,?,?)").bind(type, name, amount, text).run();
        inserted++;
      }
      if (inserted > 0) {
        await notifyChannel(env, `\u{1F4CB} ${inserted} testimoni pengundang baru tercatat.\nLihat semuanya di: https://partnerfind.ai.id/pengundang`);
      }
      return json({ success: true, inserted, skipped });
    }
    const invDel = path.match(/^\/api\/admin\/inviter-events\/(\d+)$/);
    if (invDel && method === "DELETE") {
      await env.DB.prepare("DELETE FROM inviter_events WHERE id = ?").bind(Number(invDel[1])).run();
      return json({ success: true });
    }
    if (path === "/api/admin/testimonials" && method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM testimonials ORDER BY id DESC LIMIT 200").all();
      return json({ data: results || [] });
    }
    if (path === "/api/admin/testimonials" && method === "POST") {
      const body = await parseJson(request);
      const name = String(body?.name || "").trim().slice(0, 100);
      if (!name) return fail("Nama wajib diisi.");
      const quote = String(body?.quote || "").trim().slice(0, 600);
      if (!quote) return fail("Quote testimoni wajib diisi.");
      const detail = String(body?.detail || "").trim().slice(0, 120) || null;
      let photo = null;
      if (body?.photo) {
        photo = String(body.photo);
        if (!photo.startsWith("data:image/") || photo.length > 260000) return fail("Foto tidak valid atau terlalu besar (maks ~190 KB).");
      }
      const res = await env.DB.prepare("INSERT INTO testimonials(name,quote,photo,detail) VALUES(?,?,?,?)").bind(name, quote, photo, detail).run();
      return json({ success: true, id: res?.meta?.last_row_id ?? null });
    }
    const testiDel = path.match(/^\/api\/admin\/testimonials\/(\d+)$/);
    if (testiDel && method === "DELETE") {
      await env.DB.prepare("DELETE FROM testimonials WHERE id = ?").bind(Number(testiDel[1])).run();
      return json({ success: true });
    }
    return fail("Endpoint tidak ditemukan.", 404);
  }
  return null;
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  if (path === "/api/health" && method === "GET") {
    const dbCheck = await env.DB.prepare("SELECT 1 AS ok").first();
    return json({ status: dbCheck?.ok === 1 ? "ok" : "degraded", backend: "cloudflare-d1", timestamp: nowIso() }, dbCheck?.ok === 1 ? 200 : 503);
  }
  if (path === "/api/inviter-events" && method === "GET") {
    // Aktivitas pengundang ASLI yang dicatat admin: bergabung, penarikan
    // imbalan yang dibayar, dan review pengundang.
    const rows = await env.DB.prepare("SELECT id,type,name,amount,text,created_at FROM inviter_events ORDER BY id DESC LIMIT 20").all();
    const countsRows = await env.DB.prepare("SELECT type, COUNT(*) AS n FROM inviter_events GROUP BY type").all();
    const counts = { join: 0, withdraw: 0, review: 0 };
    for (const r of countsRows?.results || []) {
      if (r.type === "join") counts.join = r.n;
      else if (r.type === "withdraw") counts.withdraw = r.n;
      else if (String(r.type).startsWith("review")) counts.review += r.n;
    }
    return json({ events: rows?.results || [], counts }, 200, { "cache-control": "public, max-age=60" });
  }
  if (path === "/api/testimonials" && method === "GET") {
    // Testimoni yang tampil di landing (di atas CTA): 3 terbaru dari panel admin.
    const rows = await env.DB.prepare("SELECT id,name,quote,photo,detail,created_at FROM testimonials ORDER BY id DESC LIMIT 3").all();
    return json({ data: rows?.results || [] }, 200, { "cache-control": "public, max-age=60" });
  }
  if (path === "/api/admin/session" && method === "GET") {
    const auth = await getAdminAuth(env);
    if (!auth) return json({ authenticated: false, setupRequired: true });
    const admin = await requireAdmin(request, env);
    return admin ? json({ authenticated: true, email: admin.email }) : fail("Silakan masuk dengan password admin.", 401);
  }
  if (path === "/api/admin/setup" && method === "POST") {
    if (await getAdminAuth(env)) return fail("Password admin sudah dibuat. Silakan masuk.", 403);
    const body = await parseJson(request);
    const password = String(body?.password || "");
    if (password.length < 8 || password.length > 200) return fail("Password minimal 8 karakter.");
    const salt = b64url(crypto.getRandomValues(new Uint8Array(16)));
    const auth = { salt, hash: await hashPassword(password, salt, PBKDF2_ITERATIONS), iterations: PBKDF2_ITERATIONS, createdAt: Date.now() };
    await writeSetting(env, AUTH_SETTING_ID, auth);
    return json({ success: true }, 200, { "set-cookie": sessionCookie(await makeSessionToken(auth), SESSION_TTL_SECONDS) });
  }
  if (path === "/api/admin/login" && method === "POST") {
    const auth = await getAdminAuth(env);
    if (!auth) return json({ error: "Password admin belum dibuat.", setupRequired: true }, 400);
    const guardNow = Date.now();
    const guard = await getLoginGuard(env);
    if (guard.lockedUntil && guard.lockedUntil > guardNow) {
      const mins = Math.max(1, Math.ceil((guard.lockedUntil - guardNow) / 60000));
      return fail(`Terlalu banyak percobaan gagal. Login dikunci, coba lagi dalam ${mins} menit.`, 429);
    }
    const body = await parseJson(request);
    const candidate = await hashPassword(String(body?.password || ""), auth.salt, Number(auth.iterations) || PBKDF2_ITERATIONS);
    if (!timingSafeEqual(candidate, auth.hash)) {
      const next = (!guard.windowStart || guardNow - guard.windowStart > LOGIN_WINDOW_MS)
        ? { fails: 0, windowStart: guardNow, lockedUntil: 0 }
        : { ...guard };
      next.fails += 1;
      if (next.fails >= LOGIN_MAX_FAILS) next.lockedUntil = guardNow + LOGIN_LOCK_MS;
      await writeSetting(env, LOGIN_GUARD_ID, next);
      return fail(next.lockedUntil ? "Password salah. Terlalu banyak percobaan gagal — login dikunci 15 menit." : "Password salah. Coba lagi.", 401);
    }
    if (guard.fails || guard.lockedUntil) await writeSetting(env, LOGIN_GUARD_ID, { fails: 0, windowStart: 0, lockedUntil: 0 });
    return json({ success: true }, 200, { "set-cookie": sessionCookie(await makeSessionToken(auth), SESSION_TTL_SECONDS) });
  }
  if (path === "/api/admin/logout" && method === "POST") {
    return json({ success: true }, 200, { "set-cookie": sessionCookie("", 0) });
  }

  // Public website settings are read-only; writes use a separately protected Access path.
  const adminSettingMatch = path.match(/^\/api\/admin\/settings\/([a-zA-Z0-9_-]+)$/);
  if (adminSettingMatch && ["PUT", "PATCH"].includes(method)) {
    const admin = await requireAdmin(request, env);
    if (!admin) return fail("Akses admin diperlukan.", 401);
    const id = adminSettingMatch[1];
    if (!SETTINGS_IDS.has(id)) return fail("Konfigurasi tidak ditemukan.", 404);
    const body = await parseJson(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Format konfigurasi tidak valid.");
    const current = await readSetting(env, id) || {};
    const updated = { ...current, ...body, updatedBy: admin.email, updatedAt: Date.now() };
    if (id === "hero_counter") {
      for (const key of ["currentCount", "groupCount"]) if (body[key] !== undefined && (!Number.isFinite(Number(body[key])) || Number(body[key]) < 0)) return fail("Nilai counter tidak valid.");
    }
    await writeSetting(env, id, updated);
    // Drop the cached public copy so the landing page picks up the change.
    try {
      if (typeof caches !== "undefined") await caches.default.delete(new Request(new URL(`/api/settings/${id}`, request.url).toString()));
    } catch { /* cache purge is best-effort */ }
    return json({ success: true, data: updated });
  }
  const imgMatch = path.match(/^\/api\/img\/([a-zA-Z0-9_-]+)$/);
  if (imgMatch && method === "GET") {
    const field = imgMatch[1];
    if (!IMAGE_FIELDS.has(field)) return fail("Gambar tidak ditemukan.", 404);
    const content = (await readSetting(env, "website_content")) || {};
    const value = content[field];
    const match = typeof value === "string" && value.match(/^data:([^;,]+);base64,([\s\S]+)$/);
    if (!match) return fail("Gambar tidak ditemukan.", 404);
    return new Response(base64ToBytes(match[2]), {
      status: 200,
      headers: { "content-type": match[1], "cache-control": "public, max-age=31536000, immutable" },
    });
  }
  const matchingResponse = await handleMatching(request, env, path, method);
  if (matchingResponse) return matchingResponse;
  const settingMatch = path.match(/^\/api\/settings\/([a-zA-Z0-9_-]+)$/);
  if (settingMatch && method === "GET") {
    const id = settingMatch[1];
    if (!SETTINGS_IDS.has(id)) return fail("Konfigurasi tidak ditemukan.", 404);
    // Public settings are read-mostly: let the edge cache serve them (see the
    // fetch handler) so D1 is only hit once per TTL window per location.
    const ttl = id === "hero_counter" ? 30 : 600;
    let data = id === "hero_counter" ? await getAndAdvanceHero(env) : (await readSetting(env, id) || {});
    if (id === "website_content" && !readCookie(request, SESSION_COOKIE)) {
      data = slimWebsiteContent(data);
    }
    return json(data, 200, { "cache-control": `public, max-age=${ttl}` });
  }

  return fail("Endpoint tidak ditemukan.", 404);
}

const SECURITY_HEADERS = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy": [
    "default-src 'self'",
    "script-src 'self' https://tally.so",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "frame-src https://tally.so https://www.youtube.com https://www.youtube-nocookie.com",
    "connect-src 'self' https://tally.so",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://tally.so",
    "frame-ancestors 'self'",
  ].join("; "),
};
const withSecurityHeaders = (response) => {
  const wrapped = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) wrapped.headers.set(name, value);
  return wrapped;
};

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        // A browser carrying the admin session cookie (the admin panel) must
        // always read fresh data, never the public edge cache — otherwise the
        // panel appears to ignore just-saved settings.
        const isAdminBrowser = (request.headers.get("cookie") || "").includes(`${SESSION_COOKIE}=`);
        const cacheable = !isAdminBrowser && request.method.toUpperCase() === "GET" && /^\/api\/(settings\/[a-zA-Z0-9_-]+|img\/[a-zA-Z0-9]+)$/.test(url.pathname);
        if (cacheable && typeof caches !== "undefined") {
          const hit = await caches.default.match(request);
          if (hit) return withSecurityHeaders(hit);
        }
        const response = withSecurityHeaders(await handleApi(request, env));
        if (cacheable && response.status === 200 && typeof caches !== "undefined") {
          ctx.waitUntil(caches.default.put(request, response.clone()));
        }
        return response;
      }
      if (env.ASSETS) return withSecurityHeaders(await env.ASSETS.fetch(request));
      return withSecurityHeaders(json({ error: "Static assets binding is not configured." }, 503));
    } catch (error) {
      console.error("Worker request failed", error);
      return fail("Terjadi kesalahan server.", 500);
    }
  },
};
