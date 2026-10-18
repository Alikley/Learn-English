import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { vocabModelsGuard, vocabDbError } from "@/lib/vocab-db";
import { lookupLocalTranslation } from "@/lib/local-dictionary";
import { NextRequest } from "next/server";
import { VOCAB_BOX_WORD_LIMIT } from "@/types/vocabulary";
import { notifyUser, faDigits } from "@/lib/notify";
// v1.0.7.1 (English 1.0.1.14) — پارام و بدنه با zod به‌جای دستی
import {
  validateObject,
  validateJson,
  boxIdParamSchema,
  vocabBoxWordSchema,
} from "@/lib/validation";

// ========================================
// افزودن کلمه به جعبه لغت‌نامه (نسخه 1.0.1.8)
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

  // کلاینت پرایسما با schema قدیمی generate شده؟ → راهنمای دقیق
  const guard = vocabModelsGuard();
  if (guard) return guard;

  const { boxId } = await params;
  const paramParsed = validateObject(boxIdParamSchema, { boxId });
  if (!paramParsed.ok) return paramParsed.response;
  const id = paramParsed.data;

  const parsed = await validateJson(req, vocabBoxWordSchema);
  if (!parsed.ok) return parsed.response;
  const { word, translation: bodyTranslation } = parsed.data;

  // معنی: اول از بدنه، بعد از لغت‌نامه محلی
  let translation = bodyTranslation;
  if (!translation) translation = lookupLocalTranslation(word);

  try {
    const box = await prisma.wordBox.findUnique({
      where: { id },
      include: { words: { orderBy: { addedAt: "asc" } } },
    });
    if (!box || box.userId !== userId) return err("جعبه یافت نشد", 404);

    // تکراری نباشد (قبل از ظرفیت — پیام مفیدتر است)
    if (box.words.some((w) => w.word.toLowerCase() === word))
      return err("این کلمه قبلاً در این جعبه هست");

    // ظرفیت جعبه
    if (box.words.length >= VOCAB_BOX_WORD_LIMIT)
      return err("این جعبه پر است — هر جعبه حداکثر ۱۰ کلمه دارد");

    const item = await prisma.wordBoxItem.create({
      data: { boxId: id, word, translation },
    });

    // v1.0.6.9 — اعلان پر شدن جعبه (هرگز خطا نمی‌دهد)
    if (box.words.length + 1 >= VOCAB_BOX_WORD_LIMIT) {
      await notifyUser(userId, {
        type: "vocab",
        link: "/vocabulary",
        titleFa: `📦 جعبهٔ «${box.name}» پر شد`,
        titleEn: `📦 Box "${box.name}" is full`,
        textFa: `این جعبه به ${faDigits(VOCAB_BOX_WORD_LIMIT)} کلمه رسید — وقت مرور کلمه‌هایش است تا در حافظهٔ بلندمدت بمانند.`,
        textEn: `This box reached ${VOCAB_BOX_WORD_LIMIT} words — time to review them so they stick in long-term memory.`,
      });
    }

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
  } catch (e) {
    const dbErr = vocabDbError(e);
    if (dbErr) return dbErr;
    throw e;
  }
}
