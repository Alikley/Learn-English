import { requireAuth, ok } from "@/lib/api-helpers";
import { getStreak, updateStreak } from "@/lib/streak";
import { ensureUserRow } from "@/lib/ensure-user";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const streak = await getStreak(auth.session.user.id);
  return ok(streak);
}

// ========================================
// ثبت فعالیت روزانه (v1.0.3.0 — گام ۲)
// همهٔ بخش‌های سایت به‌جز چت، پس از هر فعالیت این را صدا می‌زنند
// تا روزهای متوالی یادگیری فعال شود (ثبت تکراری در همان روز بی‌اثر است)
// ========================================
export async function POST() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // ✅ v1.0.3.1 — تضمین وجود رکورد کاربر پیش از نوشتن روی جدول‌های وابسته
  // (سشن معتبر ولی رکورد کاربر در دیتابیس نباشد → خطای Foreign Key)
  await ensureUserRow(auth.session);

  const streak = await updateStreak(auth.session.user.id);
  return ok({ current: streak.current, longest: streak.longest });
}
