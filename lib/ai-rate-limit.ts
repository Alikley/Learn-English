import { prisma } from "@/prisma/prisma-client";

// ========================================
// سقف مصرف روزانهٔ هوش مصنوعی (v1.0.5.0 / English 1.0.1.0)
//
// 🎯 هدف: هیچ کاربری نتواند با درخواست‌های پی‌درپی
//    جیب صاحب سایت را خالی کند — تصحیح رایتینگ (VyceAI)،
//    ساخت برگهٔ آیلتس (CodeCraft)، ترجمهٔ لغت (VyceAI) و
//    پشتیبان چت (Laya) هرکدام سقف روزانهٔ جداگانه دارند.
//    (v1.0.8.4 / English 1.0.2.3 — support-chat اضافه شد)
//
// ⚙️ مکانیک:
//    - جدول AiUsageCounter با کلید یکتا (userId, route, day)
//    - «روز» به وقت تهران (YYYY-MM-DD) — نیمه‌شب تهران
//      شمارنده عملاً صفر می‌شود
//    - افزایش اتمیک: updateMany با شرط count < limit →
//      درخواست‌های هم‌زمان نمی‌توانند از سقف رد شوند؛
//      رقابتِ ساختِ ردیف هم با unique constraint حل می‌شود
//    - سقف‌ها از env: AI_DAILY_LIMIT_WRITING /
//      AI_DAILY_LIMIT_PAPER / AI_DAILY_LIMIT_TRANSLATE /
//      AI_DAILY_LIMIT_SUPPORT
//
// 🛡️ fallback امن: اگر جدول هنوز ساخته نشده باشد
//    (مایگریشن اجرا نشده) یا خطای دیتابیس رخ دهد،
//    درخواست «مجاز» فرض می‌شود — لیمیت هرگز باعث کرش
//    یا قفل‌شدن مسیر اصلی نمی‌شود.
// ========================================

export type AiRoute =
  | "writing-correct"
  | "ielts-paper"
  | "vocab-translate"
  | "support-chat";

const DEFAULT_LIMITS: Record<AiRoute, number> = {
  "writing-correct": 30, // تصحیح رایتینگ در روز
  "ielts-paper": 100, // ساخت برگهٔ AI در روز (تولید فقط یک بار برای هر آزمون است)
  "vocab-translate": 300, // ترجمهٔ لغت در روز (با کش ۳۰روزه تقریباً هرگز پر نمی‌شود)
  "support-chat": 50, // پیام پشتیبان‌چت در روز (هر پیام = یک طبقه‌بندی Laya)
};

/** کلید env برای سقف هر مسیر */
const ENV_KEYS: Record<AiRoute, string> = {
  "writing-correct": "AI_DAILY_LIMIT_WRITING",
  "ielts-paper": "AI_DAILY_LIMIT_PAPER",
  "vocab-translate": "AI_DAILY_LIMIT_TRANSLATE",
  "support-chat": "AI_DAILY_LIMIT_SUPPORT",
};

function limitFor(route: AiRoute): number {
  const raw = process.env[ENV_KEYS[route]];
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  }
  return DEFAULT_LIMITS[route];
}

/** روز جاری به وقت تهران — «YYYY-MM-DD» */
export function tehranDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(d);
}

export type AiQuota = {
  used: number;
  limit: number;
  remaining: number;
};

async function readCount(userId: string, route: AiRoute, day: string): Promise<number> {
  const row = await prisma.aiUsageCounter.findUnique({
    where: { userId_route_day: { userId, route, day } },
    select: { count: true },
  });
  return row?.count ?? 0;
}

/**
 * وضعیت فعلی سهمیه — بدون مصرف کردن.
 * خطای دیتابیس → سهمیهٔ «باز» فرض می‌شود (fallback امن).
 */
export async function getAiQuota(userId: string, route: AiRoute): Promise<AiQuota> {
  const limit = limitFor(route);
  try {
    const used = await readCount(userId, route, tehranDay());
    return { used, limit, remaining: Math.max(0, limit - used) };
  } catch {
    return { used: 0, limit, remaining: limit };
  }
}

/**
 * مصرف یک واحد سهمیه — اتمیک و مقاوم به درخواست‌های هم‌زمان.
 * خروجی allowed=false یعنی سقف روزانه پر شده است.
 * خطای دیتابیس → allowed=true (لیمیت هرگز مسیر اصلی را نمی‌شکند).
 */
export async function consumeAiQuota(
  userId: string,
  route: AiRoute,
): Promise<AiQuota & { allowed: boolean }> {
  const limit = limitFor(route);
  const day = tehranDay();

  try {
    // ۱) افزایش اتمیک — فقط اگر هنوز زیر سقف است
    const updated = await prisma.aiUsageCounter.updateMany({
      where: { userId, route, day, count: { lt: limit } },
      data: { count: { increment: 1 } },
    });

    if (updated.count === 0) {
      // ۲) شاید ردیفی هنوز وجود ندارد (اولین درخواست امروز) → بساز
      try {
        await prisma.aiUsageCounter.create({
          data: { userId, route, day, count: 1 },
        });
      } catch {
        // ردیف وجود دارد و count >= limit (رقابت هم‌زمان) → مسدود
        const used = await readCount(userId, route, day);
        return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
      }
    }

    const used = await readCount(userId, route, day);
    return { allowed: used <= limit, used, limit, remaining: Math.max(0, limit - used) };
  } catch {
    // جدول نیست / دیتابیس موقتاً قطع است → اجازه بده
    return { allowed: true, used: 0, limit, remaining: limit };
  }
}

/** نام فارسی هر مسیر — برای پیام «سقف پر شد» */
const WHAT_FA: Record<AiRoute, string> = {
  "writing-correct": "اصلاح متن",
  "ielts-paper": "ساخت برگهٔ هوش مصنوعی",
  "vocab-translate": "ترجمهٔ هوشمند",
  "support-chat": "گفتگو با پشتیبان",
};

/** پیام فارسی یکسان برای حالت «سقف پر شد» */
export function quotaMessage(route: AiRoute, quota: AiQuota): string {
  return `سقف روزانهٔ ${WHAT_FA[route]} پر شده است (${quota.limit} در روز) — فردا دوباره می‌توانی ادامه بدهی`;
}
