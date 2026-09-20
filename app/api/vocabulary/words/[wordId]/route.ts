import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { vocabModelsGuard, vocabDbError } from "@/lib/vocab-db";
import { NextRequest } from "next/server";

// ========================================
// حذف یک کلمه از جعبه لغت‌نامه (نسخه 1.0.1.7)
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
  const id = Number(wordId);
  if (!Number.isInteger(id) || id <= 0) return err("شناسه کلمه نامعتبر است");

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
