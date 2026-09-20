import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { vocabModelsGuard, vocabDbError } from "@/lib/vocab-db";
import { NextRequest } from "next/server";

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
  const id = Number(boxId);
  if (!Number.isInteger(id) || id <= 0) return err("شناسه جعبه نامعتبر است");

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
