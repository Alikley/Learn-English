import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { vocabModelsGuard, vocabDbError } from "@/lib/vocab-db";
import { NextRequest } from "next/server";
// v1.0.7.1 (English 1.0.1.14) — پارام wordId با zod به‌جای دستی
import { validateObject, wordIdParamSchema } from "@/lib/validation";

// ========================================
// حذف یک کلمه از جعبه لغت‌نامه (نسخه 1.0.1.8)
// DELETE /api/vocabulary/words/[wordId]
// مالکیت از طریق جعبهٔ والد چک می‌شود
// ========================================

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // کلاینت پرایسما با schema قدیمی generate شده؟ → راهنمای دقیق
  const guard = vocabModelsGuard();
  if (guard) return guard;

  const { wordId } = await params;
  const parsed = validateObject(wordIdParamSchema, { wordId });
  if (!parsed.ok) return parsed.response;
  const id = parsed.data;

  try {
    const item = await prisma.wordBoxItem.findUnique({
      where: { id },
      include: { box: true },
    });
    if (!item || item.box.userId !== auth.session.user.id)
      return err("کلمه یافت نشد", 404);

    await prisma.wordBoxItem.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (e) {
    const dbErr = vocabDbError(e);
    if (dbErr) return dbErr;
    throw e;
  }
}
