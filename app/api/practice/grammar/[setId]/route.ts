import { requireAuth, ok, err } from "@/lib/api-helpers";
import { GRAMMAR_SETS } from "@/data/training/grammar-sets";
import { NextRequest } from "next/server";

// یک مجموعه گرامری کامل با ۱۰ سؤال
// نسخه ۱.۰.۱.۴

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
