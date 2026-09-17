import { requireAuth, ok } from "@/lib/api-helpers";
import { GRAMMAR_SETS_META } from "@/data/training/grammar-sets";

// لیست مجموعه‌های گرامری — فقط متادیتا (بدون سؤال‌ها)
// نسخه ۱.۰.۱.۴

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok(GRAMMAR_SETS_META);
}
