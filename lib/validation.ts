import { z } from "zod";
import { NextResponse } from "next/server";
// v1.0.5.0 (English 1.0.1.0): تعداد کتاب از طول IELTS_BOOKS — مقاوم در برابر
// real-tests.ts قدیمی (همان قاعدهٔ طلایی v1.0.4.5)
import { IELTS_BOOKS } from "@/lib/ielts/real-tests";
import { VOCAB_WORD_PATTERN, VOCAB_BOX_NAME_MAX } from "@/types/vocabulary";
import { CHAT_MAX_CONTENT } from "@/types/chat";

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
  const raw = await readJsonBody(req);
  if (!raw.ok) return raw;
  return validateObject(schema, raw.data, status);
}

/**
 * v1.0.7.1 — خواندن بدنهٔ JSON «خام» بدون اسکیما.
 * برای جریان دو مرحله‌ای (اول action، بعد اسکیمای همان action):
 * مرحلهٔ اول z.object کلیدهای دیگر را strip می‌کند، پس مرحلهٔ دوم
 * باید روی همین بدنهٔ خام اعمال شود نه روی خروجی مرحلهٔ اول.
 */
export async function readJsonBody(
  req: Request,
  status = 400,
): Promise<ValidateResult<unknown>> {
  try {
    return { ok: true, data: (await req.json()) as unknown };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "درخواست نامعتبر است" },
        { status },
      ),
    };
  }
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

// ========================================
// v1.0.7.1 (English 1.0.1.14) / گام ۳ — ولیدیشن زود همهٔ روت‌ها
//
// تا این نسخه فقط روت‌های IELTS/AI از zod استفاده می‌کردند؛
// بقیهٔ روت‌ها ورودی را دستی (typeof/Number/isInteger) پارس
// می‌کردند. این بخش همان اسکیماهای آماده را برای همهٔ
// روت‌های باقی‌مانده اضافه می‌کند.
//
// قاعدهٔ طلایی این مهاجرت (مثل v1.0.5.0):
//  ۱) پیام‌های خطا دقیقاً همان پیام‌های فارسی قبلی‌اند —
//     هیچ رابط کاربری تغییری حس نمی‌کند.
//  ۲) رفتار «آسان‌گیر» قدیمی حفظ شده (مثلاً count/level/page
//     نامعتبر → مقدار پیش‌فرض، نه خطای ۴۰۰) — با z.preprocess.
//  ۳) رفتار «سخت‌گیر» قدیمی هم سخت مانده (مثلاً واکنش چت یا
//     امتیاز بازی نامعتبر → همان پیام، همان کد).
// ========================================

// ---------- کمک‌کننده‌های عمومی ----------

/** فقط true واقعی (رشتهٔ "true" یا 1 قبول نیست) — همان `=== true` قدیمی */
function strictTrue() {
  return z.preprocess((v) => v === true, z.boolean());
}

// ---------- احراز هویت ----------

/** POST /api/auth/register — { name, email, password } */
export const registerSchema = z.object({
  name: z
    .string({ error: "همه فیلدها الزامی هستند" })
    .min(1, "همه فیلدها الزامی هستند"),
  email: z
    .string({ error: "همه فیلدها الزامی هستند" })
    .min(1, "همه فیلدها الزامی هستند"),
  password: z
    .string({ error: "همه فیلدها الزامی هستند" })
    .min(1, "همه فیلدها الزامی هستند"),
});

/** POST /api/auth/forgot-password — { email } */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "ایمیل معتبر وارد کنید" })
    .trim()
    .min(1, "ایمیل معتبر وارد کنید")
    .regex(/^\S+@\S+\.\S+$/, "ایمیل معتبر وارد کنید"),
});

const RESET_TOKEN_MSG =
  "لینک بازیابی نامعتبر است یا منقضی شده — دوباره از «فراموشی رمز» شروع کنید";

/** POST /api/auth/reset-password — { token, password } */
export const resetPasswordSchema = z.object({
  token: z
    .string({ error: RESET_TOKEN_MSG })
    .trim()
    .min(1, RESET_TOKEN_MSG),
  password: z
    .string({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد" })
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .max(100, "رمز عبور حداکثر ۱۰۰ کاراکتر باشد"),
});

// ---------- چت کاربران ----------

/** GET /api/chat?page=N — صفحه نامعتبر/اعشاری → همان رفتار آسان‌گیر قدیمی */
export const chatPageQuerySchema = z.object({
  page: z.preprocess(
    (v) => {
      if (v === null || v === undefined || v === "") return 1;
      const n = Number(v);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
    },
    z.number().int().min(1),
  ),
});

/** POST /api/chat — { content, parentId? } */
export const chatPostSchema = z.object({
  content: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "متن پیام را بنویس" : "درخواست نامعتبر است",
    })
    .trim()
    .min(1, "متن پیام را بنویس")
    .max(CHAT_MAX_CONTENT, `پیام حداکثر ${CHAT_MAX_CONTENT} کاراکتر می‌تواند باشد`),
  // parentId غیررشته‌ای (مثل عدد) در کد قدیمی بی‌صدا نادیده می‌شد — همان اینجا
  parentId: z.preprocess(
    (v) => (typeof v === "string" && v ? v : undefined),
    z.string().optional(),
  ),
});

/** POST /api/chat/[messageId]/reaction — { type: 1 | -1 | 0 } */
export const chatReactionSchema = z.object({
  type: z.union([z.literal(1), z.literal(0), z.literal(-1)], {
    error: "واکنش نامعتبر است",
  }),
});

// ---------- کتاب‌ها ----------

/** GET /api/books/progress?bookId=N — نامعتبر → بدون فیلتر (همان قدیم) */
export const bookProgressQuerySchema = z.object({
  bookId: z.preprocess(
    (v) => {
      if (v === null || v === undefined || v === "") return undefined;
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : undefined;
    },
    z.number().int().positive().optional(),
  ),
});

/** POST /api/books/progress — { bookId, page, totalPages, finished? } */
export const bookProgressPostSchema = z.object({
  bookId: z.coerce
    .number({ error: "شناسهٔ کتاب نامعتبر است" })
    .int("شناسهٔ کتاب نامعتبر است")
    .min(1, "شناسهٔ کتاب نامعتبر است"),
  page: z.coerce
    .number({ error: "شمارهٔ صفحه نامعتبر است" })
    .int("شمارهٔ صفحه نامعتبر است")
    .min(0, "شمارهٔ صفحه نامعتبر است")
    .max(100000, "شمارهٔ صفحه نامعتبر است"),
  totalPages: z.coerce
    .number({ error: "تعداد صفحه نامعتبر است" })
    .int("تعداد صفحه نامعتبر است")
    .min(0, "تعداد صفحه نامعتبر است")
    .max(100000, "تعداد صفحه نامعتبر است"),
  // finished فقط با true واقعی — رشتهٔ "true" قبول نیست (همان قدیم)
  finished: strictTrue(),
});

/** پارامتر bookId در /api/books/[bookId]/pdf — نامعتبر → همان ۴۰۴ قدیمی */
export const bookPdfParamSchema = z.coerce
  .number({ error: "Book not found" })
  .int("Book not found")
  .positive("Book not found");

// ---------- دوره‌ها ----------

/** POST /api/courses — { courseId } (ثبت‌نام/شروع دوره) */
export const courseEnrollSchema = z.object({
  courseId: z
    .string({ error: "courseId missing" })
    .min(1, "courseId missing"),
});

/** POST /api/courses/[id] — { lessonId, score? } (تکمیل درس) */
export const lessonCompleteSchema = z.object({
  lessonId: z
    .string({ error: "lessonId is required" })
    .min(1, "lessonId is required"),
  score: z.number({ error: "server error" }).optional(),
});

// ---------- بازی‌ها ----------

/** مرحلهٔ اول پارس نتیجهٔ بازی — خودِ action بعداً در switch چک می‌شود */
export const gameActionSchema = z.object({
  action: z.string({
    error: "action نامعتبر است",
  }),
});

/** body: { action: "word", won } — won فقط true واقعی */
export const gameWonSchema = z.object({ won: strictTrue() });

/** امتیاز پایانی — عدد ≥ ۰ (همان پیام قدیم) */
const gameScoreField = z.coerce
  .number({ error: "امتیاز نامعتبر است" })
  .min(0, "امتیاز نامعتبر است");

/** body: { action: "session", score } (hangman) */
export const gameSessionSchema = z.object({ score: gameScoreField });

/** شمارندهٔ خطا (mistakes/wrong) — آسان‌گیر: نامعتبر → ۰، سقف ۹۹۹ (همان قدیم) */
function clampedCounter() {
  return z.preprocess(
    (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.min(Math.trunc(n), 999) : 0;
    },
    z.number().int().min(0).max(999),
  );
}

/** body: { action: "session", score, mistakes } (memory) */
export const memorySessionSchema = z.object({
  score: gameScoreField,
  mistakes: clampedCounter(),
});

/** body: { action: "session", score, wrong } (speedquiz) */
export const speedquizSessionSchema = z.object({
  score: gameScoreField,
  wrong: clampedCounter(),
});

/** GET /api/game/leaderboard?game=… */
export const leaderboardGameSchema = z.object({
  game: z.enum(["hangman", "memory", "speedquiz"], {
    error: "بازی نامعتبر است",
  }),
});

/**
 * GET کلمات/سوال‌های بازی (?count=N&level=…)
 * — count آسان‌گیر: نامعتبر → پیش‌فرض، اعشاری → کف، سقف maxCount
 * — level اختیاری؛ ولی اگر آمد و غلط بود → ۴۰۰ (همان قدیم)
 */
export function gameWordsQuerySchema(defaultCount: number, maxCount = 30) {
  return z.object({
    count: z.preprocess(
      (v) => {
        if (v === null || v === undefined || v === "") return defaultCount;
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) return defaultCount;
        return Math.min(Math.max(Math.trunc(n), 1), maxCount);
      },
      z.number().int().min(1).max(maxCount),
    ),
    level: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z
        .enum(["EASY", "MEDIUM", "HARD"], {
          error: "سطح بازی نامعتبر است",
        })
        .optional(),
    ),
  });
}

// ---------- شنیداری ----------

/**
 * POST /api/listening/[id] — { answers }
 * کلیدها رشته (شناسهٔ gap از JSON رشته می‌آید)، مقدارها رشته؛
 * غایب → {} (همه غلط) — پایدارتر از کرش قدیمی
 */
export const listeningAnswersSchema = z.object({
  answers: z.record(z.string(), z.string()).optional().default({}),
});

// ---------- اعلان‌ها ----------

/** PATCH /api/notifications — { id? } یا { all: true } */
export const notificationPatchSchema = z.object({
  id: z.preprocess(
    (v) => (typeof v === "string" ? v : undefined),
    z.string().optional(),
  ),
  all: strictTrue().optional(),
});

/** DELETE /api/notifications — { id } */
export const notificationDeleteSchema = z.object({
  id: z.preprocess(
    (v) => (typeof v === "string" ? v : undefined),
    z.string().optional(),
  ),
});

// ---------- پوش OneSignal ----------

/** POST /api/push/subscribe — { subscriptionId } (۸..۱۲۸) */
export const pushSubscribeSchema = z.object({
  subscriptionId: z
    .string({ error: "شناسهٔ اشتراک معتبر نیست" })
    .trim()
    .min(8, "شناسهٔ اشتراک معتبر نیست")
    .max(128, "شناسهٔ اشتراک معتبر نیست"),
});

/** DELETE /api/push/subscribe — { subscriptionId } */
export const pushUnsubscribeSchema = z.object({
  subscriptionId: z
    .string({ error: "شناسهٔ اشتراک لازم است" })
    .trim()
    .min(1, "شناسهٔ اشتراک لازم است"),
});

// ---------- لغت‌نامه (جعبه‌ها) ----------

/** POST /api/vocabulary/boxes — { name } */
export const vocabBoxNameSchema = z.object({
  name: z
    .string({ error: "نام جعبه را بنویسید" })
    .trim()
    .min(1, "نام جعبه را بنویسید")
    .max(
      VOCAB_BOX_NAME_MAX,
      `نام جعبه نباید بیشتر از ${VOCAB_BOX_NAME_MAX} حرف باشد`,
    ),
});

/** POST /api/vocabulary/boxes/[boxId]/words — { word, translation? } */
export const vocabBoxWordSchema = z.object({
  word: z
    .string({ error: "کلمه را بنویسید" })
    .trim()
    .toLowerCase()
    .min(1, "کلمه را بنویسید")
    .refine((v) => VOCAB_WORD_PATTERN.test(v), {
      message: "فقط کلمه انگلیسی (حروف انگلیسی) قابل افزودن است",
    }),
  // ترجمهٔ غیررشته‌ای/خالی → null (که روت با لغت‌نامهٔ محلی پرش می‌کند) —
  // و مثل قدیم به ۱۶۰ کاراکتر بریده می‌شود (خطا نمی‌دهد)
  translation: z.preprocess(
    (v) => {
      if (typeof v !== "string") return null;
      const t = v.trim();
      return t ? t.slice(0, 160) : null;
    },
    z.string().nullable(),
  ),
});

/** پارامتر [boxId] — عدد صحیح مثبت */
export const boxIdParamSchema = z.coerce
  .number({ error: "شناسه جعبه نامعتبر است" })
  .int("شناسه جعبه نامعتبر است")
  .positive("شناسه جعبه نامعتبر است");

/** پاراممتر [wordId] — عدد صحیح مثبت */
export const wordIdParamSchema = z.coerce
  .number({ error: "شناسه کلمه نامعتبر است" })
  .int("شناسه کلمه نامعتبر است")
  .positive("شناسه کلمه نامعتبر است");

// ---------- داشبورد ----------

/**
 * PUT /api/dashboard — { nickname?, phone? }
 * رشتهٔ خالی مجاز است (پاک‌کردن مقدار — همان قدیم)؛ فقط نوع چک می‌شود
 */
export const profileUpdateSchema = z.object({
  nickname: z
    .string({ error: "خطا در آپدیت پروفایل" })
    .max(200, "خطا در آپدیت پروفایل")
    .optional(),
  phone: z
    .string({ error: "خطا در آپدیت پروفایل" })
    .max(30, "خطا در آپدیت پروفایل")
    .optional(),
});

// ---------- آیلتس: فهرست کتاب‌ها ----------

/** GET /api/ielts/books?refresh=1 — فقط مقدار «1» یعنی اسکن مجدد (همان قدیم) */
export const ieltsBooksQuerySchema = z.object({
  refresh: z.preprocess((v) => v === "1", z.boolean()),
});

// ---------- پایش UptimeRobot ----------

/** POST /api/uptime/monitors — { url, name?, interval? } */
export const uptimeMonitorSchema = z.object({
  url: z
    .string({ error: "آدرس مانیتور (url) لازم است" })
    .trim()
    .min(1, "آدرس مانیتور (url) لازم است"),
  name: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string(),
  ),
  interval: z.preprocess(
    (v) =>
      typeof v === "number" && Number.isFinite(v)
        ? Math.max(300, Math.round(v))
        : 300,
    z.number().int().min(300),
  ),
});
