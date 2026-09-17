import { requireAuth, ok } from "@/lib/api-helpers";
import { WRITING_TOPICS } from "@/data/training/writing-topics";

// لیست موضوعات نوشتاری
// نسخه ۱.۰.۱.۴

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok(WRITING_TOPICS);
}
