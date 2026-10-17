import { z } from "zod";
import { NextResponse } from "next/server";
// v1.0.5.0 (English 1.0.1.0): تعداد کتاب از طول IELTS_BOOKS — مقاوم در برابر
// real-tests.ts قدیمی (همان قاعدهٔ طلایی v1.0.4.5)
import { IELTS_BOOKS } from "@/lib/ielts/real-tests";
import { VOCAB_WORD_PATTERN } from "@/types/vocabulary";

/** تعداد کتاب‌های کمبریج — از خود فهرست */
const IELTS_BOOK_COUNT = IELTS_BOOKS.length;

// ========================================
// ولیدیشن ورودی API با zod (v1.0.5.0 / English 1.0.1.0)
//
// جایگزین پارس دستی در روت‌های IELTS و AI:
//  - پیام‌های خطا دقیقاً همان پیام‌های فارسی قبلی‌اند تا
//    رابط کاربری موجود هیچ تغییری حس نکند
//  - validateQuery / validateJson / validateObject خروجی
//    type-safe برمی‌گردانند: { ok:true, data } | { ok:false, response }
//  - روت‌های ساده می‌توانند فقط از اسکیماهای آمادهٔ همین
//    فایل استفاده کنند (paperQuery، attemptStart و…)
// ========================================

export type ValidateResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

// v1.0.5.0 — ژنریک روی خودِ اسکیما (z.output) تا transform/default
// در نوع خروجی هم اعمال شود (optional().default("") → string)

/** اولین پیام خطای zod (همهٔ اسکیماهای ما پیام فارسی دارند) */
function firstIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? "درخواست نامعتبر است";
}

/** اعتبارسنجی یک آبجکت از پیش موجود (مثل params روت) */
export function validateObject<S extends z.ZodTypeAny>(
  schema: S,
  input: unknown,
  status = 400,
): ValidateResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data as z.output<S> };
  return {
    ok: false,
    response: NextResponse.json(
      { error: firstIssueMessage(result.error) },
      { status },
    ),
  };
}

/** اعتبارسنجی query string درخواست (?book=1&skill=reading) */
export function validateQuery<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
  status = 400,
): ValidateResult<z.output<S>> {
  const url = new URL(req.url);
  const obj: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) obj[key] = value;
  return validateObject(schema, obj, status);
}

/**
 * اعتبارسنجی بدنهٔ JSON — بدنهٔ خراب همان پیام آشنای
 * «درخواست نامعتبر است» را می‌دهد
 */
export async function validateJson<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
  status = 400,
): Promise<ValidateResult<z.output<S>>> {
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "درخواست نامعتبر است" },
        { status },
      ),
    };
  }
  return validateObject(schema, input, status);
}

// ========================================
// اسکیماهای مشترک — با پیام‌های «همانِ قدیم»
// ========================================

/** شمارهٔ کتاب ۱..۲۱ (از query/param — رشتهٔ عددی) */
export const bookIdParam = z.coerce
  .number({ error: `کتاب نامعتبر است (۱..${IELTS_BOOK_COUNT})` })
  .int(`کتاب نامعتبر است (۱..${IELTS_BOOK_COUNT})`)
  .min(1, `کتاب نامعتبر است (۱..${IELTS_BOOK_COUNT})`)
  .refine((n) => n <= IELTS_BOOK_COUNT, {
    message: `کتاب نامعتبر است (۱..${IELTS_BOOK_COUNT})`,
  });

/** شمارهٔ کتاب در مسیر /api/ielts/books/[bookId] — پیام همان روت (۴۰۴) */
export const bookIdPathParam = z.coerce
  .number({
    error: `شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`,
  })
  .int(`شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`)
  .min(1, `شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`)
  .refine((n) => n <= IELTS_BOOK_COUNT, {
    message: `شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`,
  });

/** شمارهٔ تست ۱..۴ */
export const testIdParam = z.coerce
  .number({ error: "تست نامعتبر است (۱..۴)" })
  .int("تست نامعتبر است (۱..۴)")
  .min(1, "تست نامعتبر است (۱..۴)")
  .max(4, "تست نامعتبر است (۱..۴)");

/** مهارت آیلتس — مقدار مجاز: reading/listening/writing */
export const skillParam = z
  .string()
  .refine((v) => v === "reading" || v === "listening" || v === "writing", {
    message: "مهارت نامعتبر است (reading/listening/writing)",
  });

/** شمارهٔ کتاب در بدنهٔ POST /api/ielts/attempts */
export const bookIdBody = z.coerce
  .number({
    error: `شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`,
  })
  .int(`شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`)
  .min(1, `شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`)
  .refine((n) => n <= IELTS_BOOK_COUNT, {
    message: `شناسهٔ کتاب نامعتبر است (۱ تا ${IELTS_BOOK_COUNT})`,
  });

/** شمارهٔ تست در بدنهٔ POST /api/ielts/attempts */
export const testIdBody = z.coerce
  .number({ error: "شناسهٔ تست نامعتبر است (۱ تا ۴)" })
  .int("شناسهٔ تست نامعتبر است (۱ تا ۴)")
  .min(1, "شناسهٔ تست نامعتبر است (۱ تا ۴)")
  .max(4, "شناسهٔ تست نامعتبر است (۱ تا ۴)");

/** مهارت در بدنهٔ POST /api/ielts/attempts */
export const skillBody = z
  .string({ error: "مهارت نامعتبر است" })
  .refine((v) => v === "reading" || v === "listening" || v === "writing", {
    message: "مهارت نامعتبر است",
  });

/** حالت تمرین/آزمون در بدنهٔ POST /api/ielts/attempts */
export const modeBody = z
  .string({ error: "حالت نامعتبر است" })
  .refine((v) => v === "practice" || v === "exam", {
    message: "حالت نامعتبر است",
  });

/** بدنهٔ شروع تلاش: { bookId, testId, skill, mode } */
export const attemptStartSchema = z.object({
  bookId: bookIdBody,
  testId: testIdBody,
  skill: skillBody,
  mode: modeBody,
});

/**
 * پاسخ‌برگ: Record<questionId, value> — کلیدها رشتهٔ کوتاه؛
 * مقدارها unknown چون روت مثل قبل پاک‌سازی می‌کند
 * (حذف ناهماهنگ‌ها + سقف طول/تعداد)
 */
export const answersRecord = z.record(z.string(), z.unknown());

/** بدنهٔ ذخیرهٔ خودکار: { answers } */
export const answersSaveSchema = z.object({
  answers: answersRecord,
});

/** بدنهٔ تحویل: { elapsedSec?, answers? } — هر دو اختیاری */
export const attemptSubmitSchema = z.object({
  elapsedSec: z.number().min(0).optional(),
  answers: answersRecord.optional(),
});

/** بدنهٔ خودتصحیحی: { rawScore } — عدد صحیح ≥ ۰ */
export const selfScoreSchema = z.object({
  rawScore: z.coerce
    .number({ error: "نمرهٔ خام نامعتبر است" })
    .int("نمرهٔ خام نامعتبر است")
    .min(0, "نمرهٔ خام نامعتبر است"),
});

/** بدنهٔ اصلاح رایتینگ: { text } — متن دانشجو */
export const writingCorrectSchema = z.object({
  text: z
    .string({ error: "درخواست نامعتبر است" })
    .optional()
    .default(""),
});

/** بدنهٔ ترجمهٔ لغت: { word } — فقط یک کلمهٔ انگلیسی معتبر */
export const translateWordSchema = z.object({
  word: z
    .string({ error: "فقط یک کلمه انگلیسی معتبر بفرستید" })
    .optional()
    .default("")
    .refine((v) => v.trim() !== "" && VOCAB_WORD_PATTERN.test(v.trim()), {
      message: "فقط یک کلمه انگلیسی معتبر بفرستید",
    }),
});

/** پاک‌سازی پاسخ‌برگ مثل قبل: کلید ≤۲۰، مقدار رشته، حداکثر ۸۰ مدخل */
export function sanitizeAnswers(
  raw: Record<string, unknown>,
): { questionId: string; value: string }[] {
  return Object.entries(raw)
    .filter(
      ([qid, v]) =>
        typeof qid === "string" && qid.length <= 20 && typeof v === "string",
    )
    .slice(0, 80)
    .map(([questionId, value]) => ({
      questionId,
      value: (value as string).slice(0, 20000),
    }));
}

/** تبدیل Record به دیکشنری پاسخ (qid → value) مثل روت submit */
export function answersToMap(
  raw: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [qid, v] of Object.entries(raw)) {
    if (typeof v === "string" && qid.length <= 20) out[qid] = v.slice(0, 20000);
  }
  return out;
}
