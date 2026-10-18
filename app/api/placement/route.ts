import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, requireAuth } from "@/lib/api-helpers";
import { validateJson } from "@/lib/validation";
import { prisma } from "@/prisma/prisma-client";
import { PLACEMENT_QUESTIONS } from "@/data/placement/questions";
import { computePlacement, recommendFor } from "@/lib/placement";

// ========================================
// تعیین سطح (v1.0.8.0 / English 1.0.2.0)
//
// GET  /api/placement
//   → سوال‌های تست (بدون جواب‌های درست!) + آخرین نتیجهٔ کاربر
//
// POST /api/placement  body: { answers: {q1:0..3,...}, writing?: string }
//   → ارزیابی: نمرهٔ ۸ سوال + (اگر متن نوشته شده) طبقه‌بندی
//     سطح متن با مدل Laya روی سرور خودت → ذخیره در DB →
//     سطح نهایی + توصیهٔ دوره‌ها و کتاب‌های کمبریج
//
// 🔒 فقط کاربر واردشده (نتیجه ذخیره می‌شود)
// 🛡️ قطعی Laya = تعیین سطح فقط از نمرهٔ تست — بدون خطا
// ========================================

const answersSchema = z
  .object({
    answers: z.record(z.string(), z.number().int().min(0).max(3)),
    writing: z.string().max(4000).optional(),
  })
  .superRefine((data, ctx) => {
    // همهٔ ۸ سوال باید جواب داشته باشند
    const missing = PLACEMENT_QUESTIONS.filter((q) => !(q.id in data.answers));
    if (missing.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `به همهٔ ${PLACEMENT_QUESTIONS.length} سوال جواب بده`,
      });
      return;
    }
    if (data.writing !== undefined && data.writing.trim().length > 0 && data.writing.trim().length < 20) {
      ctx.addIssue({
        code: "custom",
        message: "متن نوشتاری خیلی کوتاه است — حداقل ۲۰ حرف یا خالی بگذار",
      });
    }
  });

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // آخرین نتیجه (برای «نتیجهٔ قبلی» در UI)
  const last = await prisma.placementResult.findFirst({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    // فقط متن سوال‌ها — correctIndex هرگز فرستاده نمی‌شود
    questions: PLACEMENT_QUESTIONS.map((q) => ({
      id: q.id,
      cefr: q.cefr,
      prompt: q.prompt,
      options: q.options,
    })),
    lastResult: last
      ? {
          cefr: last.cefr,
          method: last.method,
          mcScore: last.mcScore,
          writing: last.writing,
          layaLevel: last.layaLevel,
          layaConfidence: last.layaConfidence,
          createdAt: last.createdAt,
          recommendations: recommendFor(last.cefr as "A1" | "A2" | "B1" | "B2" | "C1"),
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const parsed = await validateJson(req, answersSchema);
  if (!parsed.ok) return parsed.response;

  // ارزیابی: ۸ سوال + (اختیاری) متن نوشتاری با Laya
  const outcome = await computePlacement(parsed.data.answers, parsed.data.writing ?? null);

  // ذخیرهٔ نتیجه
  const saved = await prisma.placementResult.create({
    data: {
      userId: auth.session.user.id,
      cefr: outcome.cefr,
      method: outcome.method,
      mcScore: outcome.mc.score,
      answers: parsed.data.answers,
      writing: parsed.data.writing?.trim() || null,
      layaLevel: outcome.writing.cefr,
      layaConfidence: outcome.writing.confidence,
    },
  });

  // توصیه‌ها بر اساس سطح نهایی
  const recommendations = recommendFor(outcome.cefr);

  return ok({
    cefr: outcome.cefr,
    method: outcome.method,
    mc: outcome.mc,
    writing: {
      used: outcome.writing.used,
      cefr: outcome.writing.cefr,
      confidence: outcome.writing.confidence,
      skippedReason: outcome.writing.skippedReason,
    },
    recommendations,
    savedAt: saved.createdAt,
  });
}
