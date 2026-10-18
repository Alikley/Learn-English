import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { vocabModelsGuard, vocabDbError } from "@/lib/vocab-db";
import { NextRequest } from "next/server";
// v1.0.7.1 (English 1.0.1.14) — پارام boxId با zod به‌جای دستی
import { validateObject, boxIdParamSchema } from "@/lib/validation";

// ========================================
// حذف یک جعبه لغت‌نامه (نسخه 1.0.1.8)
// DELETE /api/vocabulary/boxes/[boxId]
// کلمه‌های داخل جعبه هم به‌صورت آبشاری حذف می‌شوند
// ========================================

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boxId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // کلاینت پرایسما با schema قدیمی generate شده؟ → راهنمای دقیق
  const guard = vocabModelsGuard();
  if (guard) return guard;

  const { boxId } = await params;
  const parsed = validateObject(boxIdParamSchema, { boxId });
  if (!parsed.ok) return parsed.response;
  const id = parsed.data;

  try {
    // مالکیت را چک کن — جعبه دیگری حذف نشود
    const box = await prisma.wordBox.findUnique({ where: { id } });
    if (!box || box.userId !== auth.session.user.id)
      return err("جعبه یافت نشد", 404);

    await prisma.wordBox.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (e) {
    const dbErr = vocabDbError(e);
    if (dbErr) return dbErr;
    throw e;
  }
}
