// ========================================
// هوش مصنوعی سلف‌هاست — مدل Laya (convaiinnovations/laya)
// (v1.0.8.0 / English 1.0.2.0)
//
// 🎯 هدف: اجرای مدل Laya روی «سرور لینوکسی خودت» با سرویس
//    رسمی laya-serve (pip install "laya[serve]") و استفادهٔ
//    سایت از آن برای دو کار:
//      ۱) تعیین سطح زبان‌آموز (طبقه‌بندی متن نوشتاری به CEFR)
//      ۲) پشتیبان چت هوشمند (طبقه‌بندی پیام کاربر به موضوع و
//         انتخاب پاسخ درست از پایگاه دانش پشتیبانی)
//
// 🧠 Laya چیست؟ مدل «تصمیم‌گیری تایپ‌دار» چندزبانه از ConvAI
//    Innovations — متن تولید نمی‌کند؛ به‌جای آن با یک پاس روبه‌رو
//    (~۳۳ms روی GPU، ~۲۰۰-۴۶۰ms روی CPU) به سوال‌های تایپ‌دار
//    جواب احتمالاتیِ کالیبره‌شده می‌دهد:
//      - choice: انتخاب از گزینه‌های تعریف‌شده + confidence
//      - score:  امتیاز ترتیبی (0..N)
//      - noul:   احتمال «بله» بودن یک گزاره
//   checkpoint چندزبانه (mmBERT) فارسی را می‌فهمد — پیام فارسی
//    کاربر مستقیم طبقه‌بندی می‌شود.
//
// 🔌 پروتکل: POST {base}/v1/systemone (سازگار با TypeSafe Jev)
//    body: { state: string|object, questions: {...} }
//    پاسخ: { answers: { [کلید]: { choice/score/noul, confidence } } }
//    احراز هویت: اگر روی سرور LAYA_API_KEY تنظیم شده باشد،
//    هدر Authorization: Bearer لازم است.
//
// 🔌 متغیرهای محیطی (راهنمای کامل: SERVER-SETUP.md):
//    LAYA_BASE_URL    — مثل https://ai.example.ir  یا  http://1.2.3.4:8000
//    LAYA_API_KEY     — همان کلیدی که روی سرور در LAYA_API_KEY گذاشتی
//    LAYA_TIMEOUT_MS  — اختیاری؛ پیش‌فرض ۱۰ ثانیه (Laya سریع است)
//
// 🛡️ رفتار امن:
//    - LAYA_BASE_URL خالی → کل ماژول «خاموش»؛ صفر تماس شبکه‌ای.
//    - خطای شبکه → circuit breaker ۶۰ ثانیه؛ سایت بدون خطا به
//      مسیر جایگزین (نمرهٔ تست تشخیصی / پاسک پیش‌فرض) برمی‌گردد.
//    - هیچ کلید/URL در پیام خطا چاپ نمی‌شود (فقط نوع خطا).
//
// ⚠️ فقط سمت سرور — هیچ کامپوننت کلایتی نباید این ماژول را
//    import کند (تماس مستقیم مرورگر با سرور AI مجاز نیست).
// ========================================

// ---------- انواع سوال‌های Laya ----------

export type LayaChoiceQuestion = {
  type: "choice";
  /** دستور سوال — توضیح تصمیم مورد نیاز */
  instructions: string;
  /** گزینه‌ها: کلید → شرح گزینه (شرح‌ها انگلیسی برای مدل بهترند) */
  criteria: Record<string, string>;
};

export type LayaScoreQuestion = {
  type: "score";
  instructions: string;
  /** مقیاس ترتیبی از «کم» تا «زیاد» */
  criteria: string[];
};

export type LayaNoulQuestion = {
  type: "noul";
  instructions: string;
};

export type LayaQuestion =
  | LayaChoiceQuestion
  | LayaScoreQuestion
  | LayaNoulQuestion;

/** سوال‌های یک فراخوانی — همه در «یک پاس روبه‌رو» جواب می‌گیرند */
export type LayaQuestions = Record<string, LayaQuestion>;

// ---------- نتیجهٔ فراخوانی ----------

export type LayaAnswer =
  | { ok: true; choice: string; confidence: number }
  | { ok: true; score: number; confidence: number }
  | { ok: true; noul: number; confidence: number };

/** دلایل احتمالی شکست یک فراخوانی */
export type LayaFailReason =
  | "not-configured"
  | "timeout"
  | "network"
  | "http"
  | "empty";

export type LayaPredictResult =
  | { ok: true; answers: Record<string, LayaAnswer> }
  | { ok: false; reason: LayaFailReason };

/** نتیجهٔ طبقه‌بندی choice — شکل ساده برای مصرف‌کننده‌ها */
export type LayaChoiceResult =
  | { ok: true; choice: string; confidence: number }
  | { ok: false; reason: LayaFailReason };

// ---------- تنظیمات از env ----------

function baseUrl(): string | null {
  const raw = process.env.LAYA_BASE_URL?.trim();
  if (!raw) return null;
  // نرمال‌سازی: اسلش آخر اضافی حذف می‌شود
  return raw.replace(/\/+$/, "") || null;
}

/** آیا سرور Laya تنظیم شده؟ (بدون تماس شبکه — فقط چک env) */
export function layaConfigured(): boolean {
  return baseUrl() !== null;
}

function authHeaders(): Record<string, string> {
  const key = process.env.LAYA_API_KEY?.trim();
  if (!key) return {};
  // laya-serve هدر Bearer را چک می‌کند؛ X-API-Key هم فرستاده
  // می‌شود تا لایهٔ Nginx (اگر تنظیم شده باشد) هم بپذیرد.
  return { Authorization: `Bearer ${key}`, "X-API-Key": key };
}

// ---------- circuit breaker (وقتی سرور خاموش است، صبر تلف نکن) ----------

let downUntil = 0;

function isCircuitOpen(): boolean {
  return Date.now() < downUntil;
}

function markDown(seconds = 60): void {
  downUntil = Date.now() + seconds * 1000;
}

/** ریست حالت داخلی — فقط برای تست‌ها */
export function resetLayaForTests(): void {
  downUntil = 0;
  statusCache = null;
}

// ---------- استخراج مقاوم نام خطا (Error و DOMException) ----------

function errorName(e: unknown): string {
  if (e && typeof (e as { name?: unknown }).name === "string") {
    return (e as { name: string }).name;
  }
  return "";
}

// ---------- فراخوانی اصلی ----------

/**
 * ارسال state + questions به laya-serve — هرگز throw نمی‌کند؛
 * خطاها به‌صورت { ok: false, reason } برمی‌گردند تا مصرف‌کننده
 * بتواند بی‌دردسر fallback کند.
 */
export async function layaPredict(
  state: string,
  questions: LayaQuestions,
  options: { timeoutMs?: number } = {},
): Promise<LayaPredictResult> {
  const base = baseUrl();
  if (!base) return { ok: false, reason: "not-configured" };
  if (isCircuitOpen()) return { ok: false, reason: "network" };

  const timeoutMs =
    options.timeoutMs ?? (Number(process.env.LAYA_TIMEOUT_MS) || 10_000);

  try {
    const res = await fetch(`${base}/v1/systemone`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ state, questions }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      // 401/403 = کلید اشتباه (سرور بالا است) — circuit باز نمی‌کنیم
      return { ok: false, reason: "http" };
    }

    const data = (await res.json()) as {
      answers?: Record<string, Record<string, unknown>>;
    };
    if (!data?.answers || Object.keys(data.answers).length === 0) {
      return { ok: false, reason: "empty" };
    }

    // نرمال‌سازی پاسخ‌ها به LayaAnswer تایپ‌دار
    const answers: Record<string, LayaAnswer> = {};
    for (const [key, raw] of Object.entries(data.answers)) {
      const confidence = typeof raw.confidence === "number" ? raw.confidence : 0;
      if (typeof raw.choice === "string") {
        answers[key] = { ok: true, choice: raw.choice, confidence };
      } else if (typeof raw.score === "number") {
        answers[key] = { ok: true, score: raw.score, confidence };
      } else if (typeof raw.noul === "number") {
        answers[key] = { ok: true, noul: raw.noul, confidence };
      }
    }
    if (Object.keys(answers).length === 0) {
      return { ok: false, reason: "empty" };
    }

    return { ok: true, answers };
  } catch (e) {
    const name = errorName(e);
    if (name === "TimeoutError" || name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    // خطای اتصال = سرور قطع → ۶۰ ثانیه صرفه‌جویی در صبر کاربر
    markDown(60);
    return { ok: false, reason: "network" };
  }
}

/**
 * لایهٔ راحت: یک سوال choice بپرس و جواب ساده بگیر.
 * (کلاینت‌های سایت فقط این شکل را استفاده می‌کنند)
 */
export async function layaChoose(
  state: string,
  instructions: string,
  criteria: Record<string, string>,
  options: { timeoutMs?: number } = {},
): Promise<LayaChoiceResult> {
  const res = await layaPredict(
    state,
    { q: { type: "choice", instructions, criteria } },
    options,
  );
  if (!res.ok) return { ok: false, reason: res.reason };
  const answer = res.answers.q;
  if (answer && "choice" in answer) {
    return { ok: true, choice: answer.choice, confidence: answer.confidence };
  }
  return { ok: false, reason: "empty" };
}

// ---------- وضعیت (برای /api/ai-status) ----------

export type LayaStatus = {
  configured: boolean;
  connected: boolean;
  model: string;
  latencyMs: number | null;
  error: string | null;
};

let statusCache: { at: number; value: LayaStatus } | null = null;
const STATUS_TTL_MS = 15_000;

/**
 * سلامت‌سنجی laya-serve — یک سوال choice خیلی کوچک واقعی
 * می‌پرسد (سریع: ~۲۰۰-۴۶۰ms روی CPU). چون laya-serve مسیر
 * health جدا ندارد، این دقیق‌ترین چک ممکن است: همان مسیری که
 * سایت استفاده می‌کند واقعاً جواب می‌دهد یا نه.
 * نتیجه ۱۵ ثانیه کش می‌شود.
 */
export async function layaStatus(): Promise<LayaStatus> {
  const base = baseUrl();
  if (!base) {
    return {
      configured: false,
      connected: false,
      model: "convaiinnovations/laya",
      latencyMs: null,
      error: null,
    };
  }

  if (statusCache && Date.now() - statusCache.at < STATUS_TTL_MS) {
    return statusCache.value;
  }

  const started = Date.now();
  let value: LayaStatus;
  const res = await layaPredict(
    "health check",
    { ping: { type: "choice", instructions: "Is this a health check?", criteria: { yes: "it is a health check", no: "it is something else" } } },
    { timeoutMs: 5_000 },
  );

  if (res.ok) {
    value = {
      configured: true,
      connected: true,
      model: "convaiinnovations/laya",
      latencyMs: Date.now() - started,
      error: null,
    };
  } else if (res.reason === "http") {
    value = {
      configured: true,
      connected: false,
      model: "convaiinnovations/laya",
      latencyMs: null,
      error: "unauthorized",
    };
  } else if (res.reason === "timeout") {
    value = {
      configured: true,
      connected: false,
      model: "convaiinnovations/laya",
      latencyMs: null,
      error: "timeout",
    };
  } else {
    value = {
      configured: true,
      connected: false,
      model: "convaiinnovations/laya",
      latencyMs: null,
      error: "unreachable",
    };
  }

  statusCache = { at: Date.now(), value };
  return value;
}
