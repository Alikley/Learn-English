// ========================================
// تشخیص منبع متن یک کتاب کمبریج (v1.0.9.0 / English 1.0.2.8)
//
//   bun scripts/diag-sidecar.ts <شماره کتاب> [--force]
//   (یا: npx tsx scripts/diag-sidecar.ts 16)
//
// بعد از اجرای «scripts/ocr-book.mjs» و گذاشتن فایل sidecar کنار PDF،
// با این اسکریپت بدون سوختن توکن AI چک کنید که سرور واقعاً متن را
// از فایل sidecar می‌خواند:
//
//   ✅ source: local|b2|ocr — ocr: true — صفحات — مجموع کاراکترها
//      + چند سطر اول دو صفحه برای بررسی با چشم
//
// «--force» کش را می‌شکند (بعد از آپلود فایل تازه لازم نیست —
// نتیجهٔ بی‌متن فقط ۲ دقیقه کش می‌شود).
// ========================================

import { getBookPages, invalidatePdfCache } from "../lib/ielts/pdf-text";

async function main() {
  const book = Number(process.argv[2]?.replace(/^--/, ""));
  const force = process.argv.includes("--force");
  if (!Number.isInteger(book) || book < 1) {
    console.log("استفاده: bun scripts/diag-sidecar.ts <شماره کتاب> [--force]");
    process.exit(1);
  }
  if (force) {
    await invalidatePdfCache(book);
    console.log("🧹 کش این کتاب شکست شد");
  }

  const started = Date.now();
  const result = await getBookPages(book, force);
  const ms = Date.now() - started;

  if (!result.ok) {
    console.log(`❌ ${result.error}`);
    process.exit(1);
  }

  const total = result.pages.reduce((a, p) => a + (p ?? "").trim().length, 0);
  console.log(`📖 کتاب ${book} — ${result.pages.length} صفحه — ${total.toLocaleString("en-US")} کاراکتر (${ms}ms)`);
  console.log(`   منبع: ${result.source}${result.ocr ? " (ocr: true)" : ""}`);

  if (total < 200) {
    console.log("");
    console.log(
      "⚠️ این کتاب بی‌متن است (اسکن تصویری) و نه sidecar دارد نه OCR بسته‌بندی‌شده —",
    );
    console.log(
      "   «ساخت برگهٔ AI» همان خطای «لایهٔ متنی ندارد» را می‌دهد.",
    );
    console.log("   راه حل: node scripts/ocr-book.mjs " + book);
    process.exit(2);
  }

  const show = (idx: number) => {
    const page = result.pages[idx];
    if (!page) return;
    const lines = page.split("\n").filter(Boolean).slice(0, 4);
    console.log(`   ── صفحهٔ ${idx + 1} ──`);
    for (const line of lines) console.log(`   ${line.slice(0, 90)}`);
  };
  show(0);
  show(Math.floor(result.pages.length / 2));
  show(result.pages.length - 1);
}

main().catch((e) => {
  console.error(`❌ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
