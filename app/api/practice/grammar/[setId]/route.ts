import { requireAuth, ok, err } from "@/lib/api-helpers";
import { GRAMMAR_SETS } from "@/data/training/grammar-sets";
import { updateStreak, getStreak } from "@/lib/streak";
import { NextRequest } from "next/server";

// یک مجموعه گرامری کامل با ۱۰ سؤال
// نسخه ۱.۰.۱.۴
// v1.0.3.0 — گام ۲: POST جدید — پایان مجموعه گرامری جزو روزهای متوالی

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { setId } = await params;
  const set = GRAMMAR_SETS.find((s) => s.id === setId);

  if (!set) return err("مجموعه یافت نشد", 404);

  return ok(set);
}

// ========================================
// ثبت پایان یک مجموعه گرامری (v1.0.3.0 — گام ۲)
// POST /api/practice/grammar/[setId]   body: { score?: number }
// تمرین گرامر = فعالیت یادگیری → جزو روزهای متوالی
// ========================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ setId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const { setId } = await params;
  const set = GRAMMAR_SETS.find((s) => s.id === setId);
  if (!set) return err("مجموعه یافت نشد", 404);

  // بدنه اختیاری است — فقط برای سازگاری آینده
  try {
    await req.json();
  } catch {
    /* بدون بدنه هم قبول است */
  }

  try {
    const streak = await updateStreak(userId);
    const fresh = await getStreak(userId);
    return ok({
      streak: { current: streak.current, longest: fresh.longest },
    });
  } catch {
    return err("خطای سرور — بعداً تلاش کنید", 500);
  }
}
