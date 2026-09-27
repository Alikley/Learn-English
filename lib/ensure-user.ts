import { prisma } from "@/prisma/Prisma client";
import type { Session } from "next-auth";

// ========================================
// تضمین وجود رکورد کاربر (v1.0.3.1 — رفع باگ «پیام چت ذخیره نمی‌شود»)
//
// باگ: سشنِ معتبر NextAuth (JWT) ممکن است به رکورد کاربری اشاره کند که در
// دیتابیس وجود ندارد — مثلاً دیتابیس بازسازی شده ولی کوکی سشنِ مرورگر
// باقی مانده است. در این حالت INSERT پیام چت با خطای
// «Foreign key constraint violated on the fields: (userId)» رد می‌شد
// و پیام هرگز ذخیره نمی‌شد (صفحه چت خالی می‌ماند).
//
// راه‌حل: پیش از create، رکورد کاربر با upsert تضمین می‌شود؛
// اگر موجود نباشد از روی اطلاعات سشن (نام) دوباره ساخته می‌شود.
// (ایمیل عمداً تنظیم نمی‌شود — ستون unique است و ممکن است به کاربر دیگری تعلق داشته باشد)
// ========================================

type AuthSession = Session & {
  user: { id: string; name?: string | null; email?: string | null };
};

export async function ensureUserRow(session: AuthSession): Promise<void> {
  const uid = session.user.id;
  const name = session.user?.name?.trim() || null;

  await prisma.user.upsert({
    where: { id: uid },
    create: {
      id: uid,
      name: name ?? "کاربر",
      nickname: name,
    },
    update: {},
  });
}
