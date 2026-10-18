import { requireAuth, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/prisma/prisma-client";
import { vocabModelsGuard, vocabDbError } from "@/lib/vocab-db";
import { NextRequest } from "next/server";
import {
  DEFAULT_BOX_NAMES,
  VOCAB_BOX_WORD_LIMIT,
  type VocabBox,
} from "@/types/vocabulary";
// v1.0.7.1 (English 1.0.1.14) — پارس بدنه با zod به‌جای دستی
import { validateJson, vocabBoxNameSchema } from "@/lib/validation";

// ========================================
// جعبه‌های لغت‌نامه (نسخه 1.0.1.8)
// GET  → فهرست جعبه‌ها + کلمه‌ها (اولین بار ۲ جعبه پیش‌فرض می‌سازد)
// POST → جعبه جدید
// اگر کلاینت پرایسما قدیمی یا مهاجرت اعمال‌نشده باشد → پیام فارسی دقیق
// ========================================

type BoxRow = {
  id: number;
  name: string;
  createdAt: Date;
  words: {
    id: number;
    word: string;
    translation: string | null;
    addedAt: Date;
  }[];
};

function toVocabBox(row: BoxRow): VocabBox {
  return {
    id: row.id,
    name: row.name,
    wordCount: row.words.length,
    isFull: row.words.length >= VOCAB_BOX_WORD_LIMIT,
    words: row.words.map((w) => ({
      id: w.id,
      word: w.word,
      translation: w.translation,
      addedAt: w.addedAt.toISOString(),
    })),
  };
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  // کلاینت پرایسما با schema قدیمی generate شده؟ → راهنمای دقیق
  const guard = vocabModelsGuard();
  if (guard) return guard;

  try {
    let rows = await prisma.wordBox.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        words: { orderBy: { addedAt: "asc" } },
      },
    });

    // اولین بازدید؟ ۲ جعبه پیش‌فرض خالی بساز
    if (rows.length === 0) {
      await prisma.wordBox.createMany({
        data: DEFAULT_BOX_NAMES.map((name) => ({ userId, name })),
      });
      rows = await prisma.wordBox.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        include: {
          words: { orderBy: { addedAt: "asc" } },
        },
      });
    }

    return ok({ boxes: rows.map(toVocabBox) });
  } catch (e) {
    const dbErr = vocabDbError(e);
    if (dbErr) return dbErr;
    throw e;
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  // کلاینت پرایسما با schema قدیمی generate شده؟ → راهنمای دقیق
  const guard = vocabModelsGuard();
  if (guard) return guard;

  const parsed = await validateJson(req, vocabBoxNameSchema);
  if (!parsed.ok) return parsed.response;
  const name = parsed.data.name;

  try {
    const box = await prisma.wordBox.create({
      data: { userId, name },
      include: { words: { orderBy: { addedAt: "asc" } } },
    });

    return ok({ box: toVocabBox(box) }, 201);
  } catch (e) {
    const dbErr = vocabDbError(e);
    if (dbErr) return dbErr;
    throw e;
  }
}
