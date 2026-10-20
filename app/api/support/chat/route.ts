import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, getSession } from "@/lib/api-helpers";
import { validateJson } from "@/lib/validation";
import { supportReply } from "@/lib/support-knowledge";
import { consumeAiQuota, quotaMessage } from "@/lib/ai-rate-limit";
import { checkSupportGuest, clientIp } from "@/lib/support-rate-limit";

// ========================================
// پشتیبان چت هوشمند (v1.0.8.0 / English 1.0.2.0)
//
// POST /api/support/chat  body: { message: string }
//
// پیام فارسی/انگلیسی کاربر → مدل Laya روی سرور خودت موضوع
// را طبقه‌بندی می‌کند (checkpoint چندزبانه) → پاسخ curated
// همان موضوع + دکمه‌های سریع برمی‌گردد.
//
// 🌍 عمومی — مهمان هم می‌تواند بپرسد (هیچ دادهٔ شخصی ذخیره
//    نمی‌شود؛ فقط طبقه‌بندی لحظه‌ای)
// 🛡️ قطعی Laya = پاسخ راهنمای عمومی + دکمه‌ها — بدون خطا
//    (circuit breaker داخل lib/laya صبر تلف را می‌بندد)
//
// v1.0.8.4 (English 1.0.2.3) — ریت‌لیمیت پیش از تماس پولی Laya:
//    - کاربر واردشده: سهمیهٔ روزانهٔ AiUsageCounter
//      (پیش‌فرض ۵۰ پیام/روز — env: AI_DAILY_LIMIT_SUPPORT)
//    - مهمان: دو پنجره بر IP — ۸ پیام/دقیقه + ۱۰۰ پیام/روزِ
//      تهران (lib/support-rate-limit روی کش دو سطحی)
//    پاسخِ محدودیت همان قالب چت است (HTTP 200) تا پنل
//    زیبا نشانش دهد؛ فیلد limited=true برای شفافیت است.
// ========================================

const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "پیام خالی است")
    .max(2000, "پیام خیلی طولانی است — کوتاه‌تر بنویس"),
});

export async function POST(req: NextRequest) {
  const parsed = await validateJson(req, chatSchema);
  if (!parsed.ok) return parsed.response;

  // ——— ریت‌لیمیت (v1.0.8.4) — پیش از هر تماس پولی ———
  const session = await getSession();
  if (session?.user?.id) {
    const quota = await consumeAiQuota(session.user.id, "support-chat");
    if (!quota.allowed) {
      return ok({
        answer: quotaMessage("support-chat", quota),
        answerEn: `Your daily support chat limit is reached (${quota.limit} per day) — please come back tomorrow.`,
        actions: [],
        topic: "other",
        confidence: 0,
        engine: "fallback",
        limited: true,
      });
    }
  } else {
    const guest = await checkSupportGuest(clientIp(req));
    if (!guest.allowed) {
      const minuteHit = guest.reason === "minute";
      return ok({
        answer: minuteHit
          ? "یه لحظه نفس بکش 😊 — پیام‌ها پشت‌سرهم زیاد شد؛ حدود یک دقیقه صبر کن و دوباره بفرست."
          : "سهمیهٔ پیام‌های امروزت پر شده — فردا دوباره می‌توانی بپرسی. با ثبت‌نام سهمیهٔ روزانهٔ بیشتری هم داری.",
        answerEn: minuteHit
          ? "Easy there 😊 — too many messages in a row. Please wait about a minute and try again."
          : "You've used today's guest messages — come back tomorrow, or register for a bigger daily quota.",
        actions: minuteHit
          ? []
          : [{ label: "ورود / ثبت‌نام", labelEn: "Login / Register", href: "/login" }],
        topic: "other",
        confidence: 0,
        engine: "fallback",
        limited: true,
      });
    }
  }

  const reply = await supportReply(parsed.data.message);

  return ok({
    answer: reply.answer,
    answerEn: reply.answerEn,
    actions: reply.actions,
    topic: reply.topic,
    confidence: reply.confidence,
    engine: reply.engine,
  });
}
