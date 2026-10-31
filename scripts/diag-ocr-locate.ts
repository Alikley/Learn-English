// بررسی مکان‌یابی تست‌ها روی متن OCR بسته‌بندی‌شدهٔ یک کتاب
// استفاده: bun scripts/diag-ocr-locate.ts [bookNumber]
import { getOcrTextBook } from "../lib/ielts/ocr-text";
import { locateTestsRobust, sliceTestPages } from "../lib/ielts/ai-paper";

async function main() {
  const book = Number(process.argv[2] ?? 10);
  const ocr = await getOcrTextBook(book);
  if (!ocr) {
    console.log(`❌ OCR برای کتاب ${book} موجود نیست`);
    process.exit(1);
  }
  console.log(`کتاب ${book}: ${ocr.pages.length} صفحه / ${ocr.pages.reduce((a, p) => a + p.length, 0)} کاراکتر OCR`);
  const loc = locateTestsRobust(ocr.pages);
  console.log(`testPages (0-based):`, JSON.stringify(loc.testPages));
  console.log(`keyStart(مرز پایانی تست‌ها): ${loc.keyStart} · answerKeyStart: ${loc.answerKeyStart}`);
  for (const t of [1, 2, 3, 4]) {
    const s = sliceTestPages(ocr.pages, t);
    if (!s) {
      console.log(`Test ${t}: ❌ برش نشد`);
      continue;
    }
    console.log(
      `Test ${t}: ${s.testPageCount} صفحه — متن ${s.testText.length} کاراکتر · کلید: ${s.keyPageCount} صفحه / ${s.keyText.length} کاراکتر`,
    );
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
