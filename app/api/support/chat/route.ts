import { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api-helpers";
import { validateJson } from "@/lib/validation";
import { supportReply } from "@/lib/support-knowledge";

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
