import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/Prisma client";
import { lookupLocalTranslation } from "@/lib/local-dictionary";
import { NextRequest } from "next/server";
import { VOCAB_BOX_WORD_LIMIT, VOCAB_WORD_PATTERN } from "@/types/vocabulary";

// ========================================
// افزودن کلمه به جعبه لغت‌نامه (نسخه ۱.۰.۱.۶)
// POST /api/vocabulary/boxes/[boxId]/words
// body: { word: string, translation?: string }
// اگر translation نداد → از لغت‌نامه محلی پر می‌شود
// ========================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boxId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const { boxId } = await params;
  const id = Number(boxId);
  if (!Number.isInteger(id) || id <= 0) return err("شناسه جعبه نامعتبر است");

  const box = await prisma.wordBox.findUnique({
    where: { id },
    include: { words: { orderBy: { addedAt: "asc" } } },
  });
  if (!box || box.userId !== userId) return err("جعبه یافت نشد", 404);

  let body: { word?: unknown; translation?: unknown } | null = null;
  try {
    body = (await req.json()) as { word?: unknown; translation?: unknown };
  } catch {
    return err("درخواست نامعتبر است");
  }

  const word =
    typeof body?.word === "string" ? body.word.trim().toLowerCase() : "";
  if (!word) return err("کلمه را بنویسید");
  if (!VOCAB_WORD_PATTERN.test(word))
    return err("فقط کلمه انگلیسی (حروف انگلیسی) قابل افزودن است");

  // تکراری نباشد (قبل از ظرفیت — پیام مفیدتر است)
  if (box.words.some((w) => w.word.toLowerCase() === word))
    return err("این کلمه قبلاً در این جعبه هست");

  // ظرفیت جعبه
  if (box.words.length >= VOCAB_BOX_WORD_LIMIT)
    return err("این جعبه پر است — هر جعبه حداکثر ۱۰ کلمه دارد");

  // معنی: اول از بدنه، بعد از لغت‌نامه محلی
  let translation =
    typeof body?.translation === "string" && body.translation.trim()
      ? body.translation.trim().slice(0, 160)
      : null;
  if (!translation) translation = lookupLocalTranslation(word);

  const item = await prisma.wordBoxItem.create({
    data: { boxId: id, word, translation },
  });

  return ok(
    {
      word: {
        id: item.id,
        word: item.word,
        translation: item.translation,
        addedAt: item.addedAt.toISOString(),
      },
    },
    201,
  );
}
