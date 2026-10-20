import type { NextRequest } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { tehranDay } from "@/lib/ai-rate-limit";

// ========================================
// ریت‌لیمیت مهمان برای پشتیبان چت (v1.0.8.4 / English 1.0.2.3)
//
// 🎯 POST /api/support/chat عمومی است — مهمان هم می‌تواند
//    بپرسد و هر پیام یک فراخوانی مدل Laya است (هزینه).
//    کاربرانِ واردشده سهمیهٔ روزانهٔ خود را از AiUsageCounter
//    می‌گیرند (lib/ai-rate-limit)؛ این ماژول فقط مهمان‌ها را
//    بر اساس IP مهار می‌کند تا سوءاستفاده و هزینه باز نماند.
//
// ⚙️ دو پنجرهٔ شمارش ثابت روی کش دو سطحی (lib/cache.ts):
//    - دقیقه‌ای → ضد فلود (پیش‌فرض ۸ پیام در دقیقه)
//    - روزانه  → ضد هزینه (پیش‌فرض ۱۰۰ پیام در روزِ تهران)
//    با REDIS_URL فعال، شمارنده‌ها بین همهٔ instanceهای
//    serverless مشترک می‌شوند؛ بدون Redis هر instance
//    پنجرهٔ خودش را دارد (best-effort، همچنان ضد فلود).
//
// 🛡️ fail-open: خطای کش هرگز مسیر اصلی را نمی‌شکند.
//    شمارش get→set اتمیک نیست؛ برای چت پشتیبان کافی است
//    (سخت‌گیریِ بیش از حد بهتر از آزادیِ کامل است).
//
// env: SUPPORT_GUEST_PER_MINUTE / SUPPORT_GUEST_PER_DAY
// ========================================

const MINUTE_S = 60;
const DAY_TTL_S = 48 * 60 * 60; // TTL پنجرهٔ روزانه فقط برای تمیزکاری Redis

function limitFromEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  }
  return fallback;
}

/** IP مهمان از هدرهای پروکسی — Vercel این‌ها را ست می‌کند */
export function clientIp(req: NextRequest): string {
  const clean = (v: string | null) =>
    (v ?? "")
      .split(",")[0]
      .trim()
      .replace(/[^a-zA-Z0-9.:_-]/g, "")
      .slice(0, 60);
  const xff = clean(req.headers.get("x-forwarded-for"));
  if (xff) return xff;
  const real = clean(req.headers.get("x-real-ip"));
  if (real) return real;
  return "unknown";
}

export type SupportGuestVerdict = {
  allowed: boolean;
  /** علت محدودیت — برای پیام مناسب در پنل چت */
  reason: "minute" | "day" | null;
};

/** +۱ شمارش یک پنجره — خروجی false یعنی سقف پر است */
async function bump(key: string, limit: number, ttlS: number): Promise<boolean> {
  try {
    const used = (await cacheGet<number>(key)) ?? 0;
    if (used >= limit) return false;
    await cacheSet(key, used + 1, ttlS);
    return true;
  } catch {
    return true; // fail-open — لیمیت مسیر اصلی را نمی‌شکند
  }
}

/**
 * چک مهمان پیش از فراخوانی Laya:
 *  - سقف دقیقه‌ای (ضد فلود)      → reason="minute"
 *  - سقف روزانهٔ تهران (ضد هزینه) → reason="day"
 */
export async function checkSupportGuest(ip: string): Promise<SupportGuestVerdict> {
  const perMin = limitFromEnv("SUPPORT_GUEST_PER_MINUTE", 8);
  const perDay = limitFromEnv("SUPPORT_GUEST_PER_DAY", 100);

  const minuteWindow = Math.floor(Date.now() / (MINUTE_S * 1000));
  const minOk = await bump(`support:rl:m:${ip}:${minuteWindow}`, perMin, MINUTE_S * 2);
  if (!minOk) return { allowed: false, reason: "minute" };

  const dayOk = await bump(`support:rl:d:${ip}:${tehranDay()}`, perDay, DAY_TTL_S);
  if (!dayOk) return { allowed: false, reason: "day" };

  return { allowed: true, reason: null };
}
