// تشخیص کامل: کل مسیر ساخت برگهٔ امتحان بدون دیتابیس
// getBookPages → sliceTestPages → generateAiPaper (تماس واقعی AI)
import { getBookPages } from "../lib/ielts/pdf-text";
import { sliceTestPages, generateAiPaper, isAiExamConfigured } from "../lib/ielts/ai-paper";

async function main() {
  const book = Number(process.argv[2] ?? 1);
  const test = Number(process.argv[3] ?? 1);
  const skill = (process.argv[4] ?? "reading") as "reading" | "listening";

  console.log(`\n===== تست کامل: Book ${book} / Test ${test} / ${skill} =====`);
  console.log(`AI کانفیگ شده؟ ${isAiExamConfigured() ? "بله" : "خیر — CODECRAFT_API_KEY تنظیم نشده!"}`);

  console.log("\n[۱/۳] استخراج متن PDF از B2...");
  const pagesResult = await getBookPages(book);
  if (!pagesResult.ok) {
    console.log(`❌ شکست: ${pagesResult.error}`);
    process.exit(1);
  }
  console.log(`✅ ${pagesResult.pages.length} صفحه — ${(pagesResult.pages.join("").length / 1000).toFixed(0)}k کاراکتر`);

  console.log("\n[۲/۳] برش صفحات تست...");
  const slice = sliceTestPages(pagesResult.pages, test);
  if (!slice || !slice.testText) {
    console.log(`❌ برش نشد — slice=${slice ? "هست ولی متن تست خالی" : "null"}`);
    process.exit(1);
  }
  console.log(`✅ متن تست: ${slice.testText.length} کاراکتر — کلید پاسخ: ${slice.keyText?.length ?? 0} کاراکتر`);
  console.log(`--- ۲۰۰ کاراکتر اول متن تست ---`);
  console.log(slice.testText.slice(0, 200));

  console.log("\n[۳/۳] تماس با AI (ممکن است ۱-۴ دقیقه طول بکشد)...");
  const t0 = Date.now();
  try {
    const normalized = await generateAiPaper({
      bookNumber: book,
      testNumber: test,
      skill,
      testText: slice.testText,
      keyText: slice.keyText,
      onProgress: (pct) => console.log(`   پیشرفت: ${pct}%`),
    });
    const dt = ((Date.now() - t0) / 1000).toFixed(0);
    const paper = normalized.paper as { ok: boolean; sections?: { questions: unknown[] }[] };
    const qCount = paper.sections?.reduce((a: number, s) => a + s.questions.length, 0) ?? 0;
    console.log(`\n✅ برگه ساخته شد در ${dt}s — تعداد سوال: ${qCount}`);
    console.log(`کلید پاسخ: ${normalized.key ? Object.keys(normalized.key).length + " مدخل" : "ندارد"}`);
    console.log("\n===== نتیجه: کل پایپ‌لاین از این محیط کار می‌کند =====");
  } catch (e) {
    const dt = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`\n❌ تماس AI شکست خورد بعد از ${dt}s: ${(e as Error).message}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("💥 خطای غیرمنتظره:", e);
  process.exit(1);
});
