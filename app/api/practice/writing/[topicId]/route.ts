import { requireAuth, ok, err } from "@/lib/api-helpers";
import { WRITING_TOPICS } from "@/data/training/writing-topics";
import { NextRequest } from "next/server";

// جزئیات یک موضوع نوشتاری
// نسخه ۱.۰.۱.۴

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { topicId } = await params;
  const topic = WRITING_TOPICS.find((t) => t.id === topicId);

  if (!topic) return err("موضوع یافت نشد", 404);

  return ok(topic);
}
