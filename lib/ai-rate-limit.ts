import { prisma } from "@/prisma/Prisma client";

// ========================================
// سقف مصرف روزانهٔ هوش مصنوعی (v1.0.5.0 / English 1.0.1.0)
//
// 🎯 هدف: هیچ کاربری نتواند با درخواست‌های پی‌درپی
//    جیب صاحب سایت را خالی کند — تصحیح رایتینگ (VyceAI)،
//    ساخت برگهٔ آیلتس (CodeCraft) و ترجمهٔ لغت (VyceAI)
//    هرکدام سقف روزانهٔ جداگانه دارند.
//
// ⚙️ مکانیک:
//    - جدول AiUsageCounter با کلید یکتا (userId, route, day)
//    - «روز» به وقت تهران (YYYY-MM-DD) — نیمه‌شب تهران
//      شمارنده عملاً صفر می‌شود
//    - افزایش اتمیک: updateMany با شرط count < limit →
//      درخواست‌های هم‌زمان نمی‌توانند از سقف رد شوند؛
//      رقابتِ ساختِ ردیف هم با unique constraint حل می‌شود
//    - سقف‌ها از env: AI_DAILY_LIMIT_WRITING /
//      AI_DAILY_LIMIT_PAPER / AI_DAILY_LIMIT_TRANSLATE
//
// 🛡️ fallback امن: اگر جدول هنوز ساخته نشده باشد
//    (مایگریشن اجرا نشده) یا خطای دیتابیس رخ دهد،
//    درخواست «مجاز» فرض می‌شود — لیمیت هرگز باعث کرش
//    یا قفل‌شدن مسیر اصلی نمی‌شود.
// ========================================

export type AiRoute = "writing-correct" | "ielts-paper" | "vocab-translate";

const DEFAULT_LIMITS: Record<AiRoute, number> = {
  "writing-correct": 30, // تصحیح رایتینگ در روز
  "ielts-paper": 100, // ساخت برگهٔ AI در روز (تولید فقط یک بار برای هر آزمون است)
  "vocab-translate": 300, // ترجمهٔ لغت در روز (با کش ۳۰روزه تقریباً هرگز پر نمی‌شود)
};

function limitFor(route: AiRoute): number {
  const envKey =
    route === "writing-correct"
      ? "AI_DAILY_LIMIT_WRITING"
      : route === "ielts-paper"
        ? "AI_DAILY_LIMIT_PAPER"
        : "AI_DAILY_LIMIT_TRANSLATE";
  const raw = process.env[envKey];
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

/** پیام فارسی یکسان برای حالت «سقف پر شد» */
export function quotaMessage(route: AiRoute, quota: AiQuota): string {
  const what =
    route === "writing-correct"
      ? "اصلاح متن"
      : route === "ielts-paper"
        ? "ساخت برگهٔ هوش مصنوعی"
        : "ترجمهٔ هوشمند";
  return `سقف روزانهٔ ${what} پر شده است (${quota.limit} در روز) — فردا دوباره می‌توانی ادامه بدهی`;
}
