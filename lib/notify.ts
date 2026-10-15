import { prisma } from "@/prisma/Prisma client";

// ========================================
// سازندهٔ اعلان‌های واقعی کاربر (v1.0.6.9 / English 1.0.1.12)
//
// این تابع «هرگز throw نمی‌کند» — ثبت اعلان یک عملکرد
// فرعی است و اگر دیتابیس خطا بدهد، مسیر اصلی (ثبت درس،
// بازی، آزمون و…) نباید بشکند. خطا فقط در لاگ سرور
// چاپ می‌شود.
//
// نقطه‌های فراخوانی: register، استریک، دوره‌ها، بازی‌ها،
// شنیداری، کتاب، آیلتس، لغت‌نامه — همیشه «بعد از»
// نوشتن اصلی دیتابیس و «قبل از» return.
// ========================================

/** نوع اعلان — با ستون type (VARCHAR(32)) مطابق است */
export type NotifType =
  | "streak"
  | "course"
  | "ielts"
  | "game"
  | "vocab"
  | "listening"
  | "book"
  | "welcome"
  | "system";

type NotifyParams = {
  type: NotifType;
  titleFa: string;
  titleEn?: string;
  textFa: string;
  textEn?: string;
  /** لینک داخلی سایت برای دکمهٔ «مشاهده» */
  link?: string;
};

/** روزهای قشنگ استریک که اعلان می‌گیرند */
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

/** سقف اعلان هر کاربر — قدیمی‌ترینِ «خوانده‌شده»ها حذف می‌شوند */
const MAX_PER_USER = 80;

/**
 * ساخت یک اعلان برای کاربر — هرگز throw نمی‌کند.
 * بعد از create، اگر تعداد اعلان‌های کاربر از سقف بیشتر
 * شد، اعلان‌های «خوانده‌شدهٔ» قدیمی (نه ناخوانده‌ها) حذف
 * می‌شوند تا لیست سبک بماند.
 */
export async function notifyUser(
  userId: string,
  params: NotifyParams,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: params.type,
        titleFa: params.titleFa,
        titleEn: params.titleEn ?? null,
        textFa: params.textFa,
        textEn: params.textEn ?? null,
        link: params.link ?? null,
      },
    });

    // هرس: فقط ردیف‌های خوانده‌شدهٔ قدیمی حذف می‌شوند
    const total = await prisma.notification.count({
      where: { userId },
    });
    const overflow = total - MAX_PER_USER;
    if (overflow > 0) {
      const oldestRead = await prisma.notification.findMany({
        where: { userId, isRead: true },
        orderBy: { createdAt: "asc" },
        take: overflow,
        select: { id: true },
      });
      if (oldestRead.length > 0) {
        await prisma.notification.deleteMany({
          where: { id: { in: oldestRead.map((n) => n.id) } },
        });
      }
    }
  } catch (e) {
    // اعلان هرگز نباید مسیر اصلی را بشکند
    console.error("[notify]", e);
  }
}

/** تبدیل ارقام لاتین به ارقام فارسی (۰۱۲۳۴۵۶۷۸۹) */
export function faDigits(x: string | number): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return String(x).replace(/[0-9]/g, (d) => fa[Number(d)]);
}
