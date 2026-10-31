// تشخیص زنده: چرا «برگه امتحان» ساخته نمی‌شود؟
// دقیقاً همان مسیر getBookPages را با PDF واقعی B2 اجرا می‌کند.
import { getBookPages } from "../lib/ielts/pdf-text";

async function main() {
  const book = Number(process.argv[2] ?? 1);
  console.log(`\n===== getBookPages(book=${book}) — شروع =====`);
  const t0 = Date.now();
  const res = await getBookPages(book);
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  if (!res.ok) {
    console.log(`❌ خطا (${dt}s): ${res.error}`);
    process.exit(1);
  }
  console.log(`✅ موفق (${dt}s) — منبع: ${res.source} — تعداد صفحات: ${res.pages.length}`);
  const totalChars = res.pages.reduce((a, p) => a + p.length, 0);
  console.log(`مجموع کاراکترهای متن: ${totalChars}`);
  // صفحات خالی (اسکن تصویری) vs صفحات با متن
  const withText = res.pages.filter((p) => p.trim().length > 50).length;
  console.log(`صفحات با متن قابل استخراج: ${withText} / ${res.pages.length}`);
  console.log(`\n--- نمونه صفحهٔ ۵۰ (اولین ۳۰۰ کاراکتر) ---`);
  console.log(res.pages[49]?.slice(0, 300) ?? "(صفحه ۵۰ وجود ندارد)");
  console.log(`\n===== پایان =====`);
}

main().catch((e) => {
  console.error("💥 خطای غیرمنتظره:", e);
  process.exit(1);
});
