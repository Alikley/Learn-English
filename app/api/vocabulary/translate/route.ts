import { ok, err, getSession } from "@/lib/api-helpers";
import { lookupLocalTranslation } from "@/lib/local-dictionary";
import { NextRequest } from "next/server";
import { VOCAB_WORD_PATTERN, type TranslateResult } from "@/types/vocabulary";

// ========================================
// ترجمه یک کلمه انگلیسی (نسخه ۱.۰.۱.۶)
// POST /api/vocabulary/translate  body: { word }
// ۱) لغت‌نامه محلی (بدون نیاز به ورود) — فوری
// ۲) هوش مصنوعی VYCEAI (فقط کاربر واردشده + کلید VYCEAI_API_KEY)
// پاسخ همیشه 200 با ترجمه یا پیام فارسی
// ========================================

const VYCEAI_URL = "https://vyceai.com/v1/chat/completions";
const VYCEAI_MODEL = "agnes-3.0-flash";
const TIMEOUT_MS = 20_000;

/** کش درخواست‌های ترجمه — حافظه سرور توسعه، سقف ۱۰۰۰ مدخل */
const aiCache = new Map<string, string>();
const AI_CACHE_MAX = 1000;

function cacheAiTranslation(word: string, translation: string): void {
  if (aiCache.size >= AI_CACHE_MAX) {
    // قدیمی‌ترین مدخل را بینداز
    const firstKey = aiCache.keys().next().value;
    if (firstKey !== undefined) aiCache.delete(firstKey);
  }
  aiCache.set(word, translation);
}

const TRANSLATE_PROMPT = `You are a Persian-English dictionary. Translate the given single English word to Persian (Farsi).
Respond ONLY with the Persian translation — no English, no explanation, no quotes, no punctuation. Maximum 4 words.`;

async function translateWithAi(word: string): Promise<string | null> {
  const apiKey = process.env.VYCEAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(VYCEAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VYCEAI_MODEL,
        messages: [
          { role: "system", content: TRANSLATE_PROMPT },
          { role: "user", content: word },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    // پاک‌سازی: حذف کوتیشن/فنس/فضای اضافه — فقط خط اول
    const translation = content
      .replace(/```[a-z]*|```/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)[0]
      ?.replace(/^["'«]+|["'»]+$/g, "")
      .slice(0, 60);

    return translation || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: { word?: unknown } | null = null;
  try {
    body = (await req.json()) as { word?: unknown };
  } catch {
    return err("درخواست نامعتبر است");
  }

  const word = typeof body?.word === "string" ? body.word.trim() : "";
  if (!word || !VOCAB_WORD_PATTERN.test(word))
    return err("فقط یک کلمه انگلیسی معتبر بفرستید");

  const normalized = word.toLowerCase();

  // ۱) لغت‌نامه محلی — بدون نیاز به ورود
  const local = lookupLocalTranslation(normalized);
  if (local) {
    const result: TranslateResult = {
      word: normalized,
      translation: local,
      source: "local",
    };
    return ok(result);
  }

  // ۲) کش هوش مصنوعی
  const cached = aiCache.get(normalized);
  if (cached) {
    const result: TranslateResult = {
      word: normalized,
      translation: cached,
      source: "ai",
    };
    return ok(result);
  }

  // ۳) هوش مصنوعی — فقط کاربر واردشده (هزینه دارد)
  const session = await getSession();
  if (!session?.user?.id) {
    const result: TranslateResult = {
      word: normalized,
      translation: null,
      source: null,
      message: "این کلمه در لغت‌نامه محلی نیست — برای ترجمه هوشمند وارد شوید",
    };
    return ok(result);
  }

  const ai = await translateWithAi(normalized);
  if (ai) {
    cacheAiTranslation(normalized, ai);
    const result: TranslateResult = {
      word: normalized,
      translation: ai,
      source: "ai",
    };
    return ok(result);
  }

  const result: TranslateResult = {
    word: normalized,
    translation: null,
    source: null,
    message: "ترجمه‌ای پیدا نشد — کلید سرویس ترجمه تنظیم نشده یا موقتاً در دسترس نیست",
  };
  return ok(result);
}
