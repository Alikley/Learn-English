import { ok, requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";

// ========================================
// GET /api/placement/status (v1.0.2.2 / English 1.0.2.2)
//
// سبک‌ترین راه برای دانستن «سطح کاربر چیست / اصلاً دارد؟»:
//   → { available: true, cefr: "B1" }   کاربر تست داده
//   → { available: true, cefr: null }    تست نداده → گیت نوبار
//   → { available: false, cefr: null }   جدول تعیین سطح نیست
//                                        (مایگریشن اجرا نشده) → گیت غیرفعال
//
// مصرف‌کننده‌ها: usePlacementStatus (نوبار + AuthGuard).
// 🔒 فقط کاربر واردشده.
// fail-open: خطای دیتابیس هرگز سایت را قفل نمی‌کند.
// ========================================

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const last = await prisma.placementResult.findFirst({
      where: { userId: auth.session.user.id },
      orderBy: { createdAt: "desc" },
      select: { cefr: true },
    });
    return ok({ available: true, cefr: last?.cefr ?? null });
  } catch {
    // جدول PlacementResult هنوز ساخته نشده → سطح‌ها خاموش،
    // سایت مثل قبل کار می‌کند (بدون گیت و بدون بج)
    return ok({ available: false, cefr: null });
  }
}
