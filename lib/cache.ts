// ========================================
// کش دو سطحی — L1 حافظهٔ سرور + L2 Redis (v1.0.4.6 / English 1.0.0.10)
//
// 🎯 هدف: پاسخ‌های پرهزینه (توکن‌های B2، متن صفحات PDF،
//    برگه‌های امتحان، ترجمه‌های AI) فقط «یک بار» ساخته شوند
//    و بین همهٔ کاربران و همهٔ instanceهای سرور به اشتراک
//    بگذارند — نه اینکه هر پروسهٔ سرور کشِ خودش را داشته باشد.
//
// ✅ رفتار:
//    - REDIS_URL تنظیم شده → L1 حافظه (آینهٔ داغ) + L2 Redis
//      مشترک بین instanceها؛ انقضا روی Redis با TTL واقعی.
//    - REDIS_URL خالی یا Redis در دسترس نیست → فقط L1 حافظه؛
//      یعنی دقیقاً همان رفتار نسخه‌های قبلی — هیچ خطایی
//      به کاربر نمی‌رسد و نیازی به راه‌اندازی Redis نیست.
//
// 🔌 متغیرهای محیطی:
//    REDIS_URL       — مثل redis://default:pass@host:6379 یا
//                      rediss://:pass@host:443 (اتصال TLS)
//    REDIS_PREFIX    — پیشوند کلیدها (پیش‌فرض: eng:v1:)
//    REDIS_TLS_REJECT_UNAUTHORIZED — 0 یعنی گواهی self-signed سرور
//                      قبول می‌شود (لازم برای redis عمومی TCP-passthrough)
//
// ⚠️ فقط سمت سرور — هیچ کامپوننت کلایتی نباید این ماژول را
//    import کند (ioredis در مرورگر اجرا نمی‌شود).
// ========================================

import Redis from "ioredis";

const KEY_PREFIX = process.env.REDIS_PREFIX ?? "eng:v1:";

/**
 * REDIS_TLS_REJECT_UNAUTHORIZED=0 → گواهی self-signed قبول می‌شود
 * (برای redis عمومی از نوع TCP-passthrough با گواهی خودامضای سرور)
 */
const REDIS_TLS_INSECURE = ["0", "false", "no", "off"].includes(
  (process.env.REDIS_TLS_REJECT_UNAUTHORIZED ?? "").trim().toLowerCase(),
);

/** سقف مدخل‌های L1 (حافظه) — بعد از آن قدیمی‌ترین‌ها می‌افتند */
const L1_MAX_ENTRIES = 1000;
/** سقف عمر مدخل L1 — TTL واقعی همان Redis است؛ L1 فقط آینهٔ داغ کوتاه‌عمر است */
const L1_TTL_CAP_MS = 5 * 60 * 1000;
/** عمر مدخل‌هایی که از Redis به L1 آورده می‌شوند (هیدریشن) */
const L1_HYDRATE_MS = 60 * 1000;

type L1Entry = { raw: string; expiresAt: number };
const l1 = new Map<string, L1Entry>();

// ---------- اتصال Redis (تنها یک نمونه در طول عمر پروسه) ----------

let redisClient: Redis | null | undefined; // undefined = هنوز سازشده؛ null = غیرفعال
let redisHealthy = false;

function redisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  return url ? url : null;
}

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = redisUrl();
  if (!url) {
    redisClient = null;
    return null;
  }

  try {
    const client = new Redis(url, {
      // v1.0.8.2 (English 1.0.2.1) — rediss:// → اتصال TLS؛ برای
      // ingress عمومی TCP-passthrough که گواهی سرور self-signed است
      // با REDIS_TLS_REJECT_UNAUTHORIZED=0 پذیرش گواهی آزاد می‌شود.
      ...(url.startsWith("rediss://")
        ? { tls: { rejectUnauthorized: !REDIS_TLS_INSECURE } }
        : {}),
      // اگر Redis در دسترس نبود، بی‌درنگ خطا بده و به L1 برگردیم —
      // هیچ درخواستی قفل نماند (default: صف آفلاین تا ۱۰ ثانیه)
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3_000,
      retryStrategy: (times) => Math.min(times * 500, 5_000),
    });
    client.on("ready", () => {
      redisHealthy = true;
    });
    client.on("error", () => {
      redisHealthy = false;
    });
    client.on("end", () => {
      redisHealthy = false;
    });
    redisClient = client;
    return client;
  } catch {
    redisClient = null;
    return null;
  }
}

// ---------- L1 (حافظه) ----------

function l1Set(key: string, raw: string, expiresAt: number): void {
  if (l1.size >= L1_MAX_ENTRIES) {
    // اول مدخل‌های منقضی را بینداز، بعد قدیمی‌ترین‌ها (ترتیب درج)
    const now = Date.now();
    for (const [k, v] of l1) {
      if (v.expiresAt <= now) l1.delete(k);
      if (l1.size < L1_MAX_ENTRIES) break;
    }
    while (l1.size >= L1_MAX_ENTRIES) {
      const oldest = l1.keys().next().value;
      if (oldest === undefined) break;
      l1.delete(oldest);
    }
  }
  l1.set(key, { raw, expiresAt });
}

// ---------- API عمومی ----------

/** آیا Redis تنظیم شده؟ (برای لاگ/وضعیت) */
export function isRedisConfigured(): boolean {
  return redisUrl() !== null;
}

/**
 * خواندن از کش — اول L1، بعد Redis (و آینه‌سازی در L1).
 * خروجی null یعنی «miss» — مقدار null خودش کش نمی‌شود.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const k = KEY_PREFIX + key;
  const now = Date.now();

  const mem = l1.get(k);
  if (mem) {
    if (mem.expiresAt > now) {
      try {
        return JSON.parse(mem.raw) as T;
      } catch {
        l1.delete(k); // JSON خراب → مثل miss رفتار کن
      }
    } else {
      l1.delete(k);
    }
  }

  const client = getRedis();
  if (client && redisHealthy) {
    try {
      const raw = await client.get(k);
      if (raw != null) {
        l1Set(k, raw, now + L1_HYDRATE_MS);
        try {
          return JSON.parse(raw) as T;
        } catch {
          await client.del(k).catch(() => undefined);
        }
      }
    } catch {
      // Redis خطا داد → با L1 ادامه بده
    }
  }

  return null;
}

/** نوشتن در کش (L1 + Redis با TTL ثانیه) */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const k = KEY_PREFIX + key;
  const ttl = Math.max(1, Math.floor(ttlSeconds));
  let raw: string;
  try {
    raw = JSON.stringify(value);
  } catch {
    return; // مقدار سریال‌نشدنی — فقط در L1 نگه نداریم هم
  }

  l1Set(k, raw, Date.now() + Math.min(ttl * 1000, L1_TTL_CAP_MS));

  const client = getRedis();
  if (client && redisHealthy) {
    try {
      await client.set(k, raw, "EX", ttl);
    } catch {
      // Redis خطا داد → L1 کافی است
    }
  }
}

/** حذف یک یا چند کلید از هر دو سطح */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const full = keys.map((key) => KEY_PREFIX + key);
  for (const k of full) l1.delete(k);

  const client = getRedis();
  if (client && redisHealthy) {
    try {
      await client.del(...full);
    } catch {
      // بی‌صدا — TTL خودش تمیز می‌کند
    }
  }
}

/**
 * حذف همهٔ کلیدهایی که با پیشوند شروع می‌شوند (SCAN — بدون
 * قفل‌کردن Redis). برای «اسکن مجدد B2» و شکستن دسته‌ای کش.
 */
export async function cacheDelPrefix(prefix: string): Promise<number> {
  const fullPrefix = KEY_PREFIX + prefix;
  let removed = 0;

  for (const k of l1.keys()) {
    if (k.startsWith(fullPrefix)) {
      l1.delete(k);
      removed++;
    }
  }

  const client = getRedis();
  if (client && redisHealthy) {
    try {
      let cursor = "0";
      do {
        const [next, keys] = await client.scan(
          cursor,
          "MATCH",
          fullPrefix + "*",
          "COUNT",
          200,
        );
        cursor = next;
        if (keys.length > 0) {
          await client.del(...keys);
          removed += keys.length;
        }
      } while (cursor !== "0");
    } catch {
      // بی‌صدا
    }
  }
  return removed;
}

/**
 * خواندن یا ساخت — پترن اصلی همهٔ مصرف‌کننده‌ها:
 *   ۱) hit از L1/L2 → بدون زحمت برگرد
 *   ۲) miss → loader() اجرا و نتیجه در هر دو سطح ذخیره و برگرد
 * اگر loader خطا بدهد، هیچی کش نمی‌شود و خطا بالا می‌رود
 * (همان رفتار قبلی ماژول‌ها).
 */
export async function cacheWrap<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await loader();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

/** وضعیت کش — برای روت /api/cache-status */
export async function cacheStats(): Promise<{
  driver: "redis" | "memory";
  redisConfigured: boolean;
  redisConnected: boolean;
  l1Entries: number;
  l2Keys: number | null;
}> {
  const client = getRedis();
  let connected = false;
  let l2Keys: number | null = null;
  if (client) {
    try {
      const pong = await client.ping();
      connected = pong === "PONG";
      if (connected) l2Keys = await client.dbsize();
    } catch {
      connected = false;
    }
  }
  return {
    driver: connected ? "redis" : "memory",
    redisConfigured: isRedisConfigured(),
    redisConnected: connected,
    l1Entries: l1.size,
    l2Keys,
  };
}
