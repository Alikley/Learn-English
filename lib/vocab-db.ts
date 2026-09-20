import { prisma } from "@/prisma/Prisma client";
import { err } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

// ========================================
// گاردهای دیتابیس لغت‌نامه (نسخه 1.0.1.8)
// اگر کلاینت پرایسما با schema قدیمی generate شده باشد
// (prisma.wordBox وجود ندارد) یا مهاجرت لغت‌نامه اعمال نشده باشد،
// به‌جای خطای خام 500 یک پیام فارسی دقیق با راه‌حل برمی‌گردانیم.
// ========================================

/** پیام وقتی مدل‌های لغت‌نامه در کلاینت پرایسما نیستند */
export const PRISMA_GENERATE_HINT =
  "کلاینت پرایسما به‌روز نشده است — یک بار دستور «npx prisma generate» را در پوشه پروژه اجرا کنید و بعد سرور را ری‌استارت کنید (npm run dev خودش این کار را می‌کند)";

/** پیام وقتی جدول‌های لغت‌نامه در دیتابیس ساخته نشده‌اند */
export const PRISMA_MIGRATE_HINT =
  "جدول‌های لغت‌نامه هنوز در دیتابیس ساخته نشده‌اند — دستور «npx prisma migrate deploy» را در پوشه پروژه اجرا کنید";

/** آیا مدل‌های لغت‌نامه در این کلاینت پرایسما موجودند؟ */
export function vocabModelsReady(): boolean {
  return (
    typeof prisma === "object" &&
    prisma !== null &&
    "wordBox" in prisma &&
    "wordBoxItem" in prisma
  );
}

/**
 * گارد ابتدای هر روت لغت‌نامه:
 * اگر کلاینت قدیمی بود → پاسخ خطای راهنمادار، وگرنه null (یعنی ادامه بده)
 */
export function vocabModelsGuard(): NextResponse | null {
  if (vocabModelsReady()) return null;
  return err(PRISMA_GENERATE_HINT, 500);
}

/**
 * خطای شناخته‌شده دیتابیس را به پیام فارسی تبدیل کن:
 * P2021 = جدول وجود ندارد → راهنمای migrate deploy
 * خروجی null یعنی خطا شناخته‌شده نبود (باید مثل قبل throw شود)
 */
export function vocabDbError(e: unknown): NextResponse | null {
  if (typeof e === "object" && e !== null && "code" in e) {
    const code = (e as { code?: string }).code;
    if (code === "P2021" || code === "P2022") return err(PRISMA_MIGRATE_HINT, 500);
  }
  return null;
}
