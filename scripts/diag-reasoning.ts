// بازتولید خطای کاربر: کانفیگ دیپ‌سیک با CODECRAFT_MAX_TOKENS=384
// روی مدل استدلالی deepseek-flash — و تأیید رفع v1.0.8.7.
//
// اجرا (مقادیر env را خود اسکریپت از process.env می‌خواند):
//   CODECRAFT_API_KEY=sk-… CODECRAFT_BASE_URL=https://api.deepseek.com/v1 \
//   CODECRAFT_MODEL=deepseek-flash CODECRAFT_MAX_TOKENS=384 \
//   npx tsx scripts/diag-reasoning.ts
import {
  callCodeCraft,
  aiProviderLabel,
  aiExamStatus,
} from "../lib/ielts/ai-paper";

// پرامپتِ شبیهٔ برگه‌ساز — استخراج JSON ساختاریافته از متنِ نویزی PDF
const paperLikePrompt = [
  {
    role: "system" as const,
    content:
      'You are an IELTS exam transcription engine. Convert the raw text into ONE valid JSON object {"sections":[…],"answerKey":{…}} with all 40 questions exactly once. No markdown, JSON only.',
  },
  {
    role: "user" as const,
    content:
      "Cambridge IELTS Book 1 — Test 1 — extract the LISTENING paper.\n<TEST_TEXT>\n" +
      "SECTION 1 Questions 1-10. Complete the notes below. Write ONE WORD AND/OR A NUMBER. " +
      "Example: The tour starts at {GAP}. 1. Price per person: {GAP}. 2. Booking must be made by {GAP}. " +
      "3. The guide worked previously as a {GAP}. 4. Customers should bring their own {GAP}. " +
      "Test 1 running header — extracted with broken line- breaks and hyphen- ation artifacts, page numbers 3, 4, 5…\n".repeat(
        24,
      ) +
      "</TEST_TEXT>\n<ANSWER_KEY_TEXT>\n1 9 am  2 £15  3 Thursday …\n</ANSWER_KEY_TEXT>",
  },
];

async function main(): Promise<void> {
  console.log(`سرویس: ${aiProviderLabel()}`);
  const status = aiExamStatus();
  console.log("وضعیت:", JSON.stringify(status, null, 2));

  console.log(
    "\n[۱] تماس با سقفِ تنظیم‌شدهٔ کاربر (۳۸۴ توکن) — انتظار: خطای دقیق «سقف پر شد»",
  );
  try {
    const r = await callCodeCraft(paperLikePrompt); // پیش‌فرض = baseMaxTokens = 384
    console.log(
      `⚠️ بدون خطا برگشت (finish=${r.finishReason}, content=${r.content.length}, reasoning=${r.reasoningChars})`,
    );
  } catch (e) {
    console.log(`✅ خطای دقیق جدید:\n   ${(e as Error).message}`);
  }

  console.log(
    "\n[۲] همان تماس با کفِ جدید برگه (۳۲۰۰۰ توکن) — انتظار: JSON کامل",
  );
  const t0 = Date.now();
  try {
    const r = await callCodeCraft(paperLikePrompt, 32000);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const hasJson = r.content.trim().startsWith("{");
    console.log(
      `✅ موفق در ${secs}s — content=${r.content.length} نویسه (JSON: ${hasJson ? "بله" : "نظرسنجی شد"}), reasoning=${r.reasoningChars} نویسه, finish=${r.finishReason}`,
    );
  } catch (e) {
    console.log(`❌ شکست: ${(e as Error).message}`);
  }
}

main().catch((e) => {
  console.error("💥 خطای غیرمنتظره:", e);
  process.exit(1);
});
