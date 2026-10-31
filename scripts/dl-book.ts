// دانلود PDF یک کتاب کمبریج از باکت B2 به فایل محلی
// استفاده: bun scripts/dl-book.ts <bookNumber> [outPath]
import { scanCambridge, signedCambridgeUrl } from "../lib/b2-cambridge";
import { writeFile } from "node:fs/promises";

async function main() {
  const book = Number(process.argv[2] ?? 10);
  const out = process.argv[3] ?? `/tmp/book-${book}.pdf`;
  const scan = await scanCambridge();
  if (!scan.configured || scan.error) {
    console.log(`❌ B2 پیکربندی نشده: ${scan.error ?? "?"}`);
    process.exit(1);
  }
  const files = scan.books[book];
  if (!files?.pdfPath) {
    console.log(`❌ PDF کتاب ${book} در باکت نیست — کتاب‌های موجود: ${Object.keys(scan.books).join(", ")}`);
    process.exit(1);
  }
  const url = await signedCambridgeUrl(scan.bucketName!, files.pdfPath);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.log(`❌ دانلود ناموفق: HTTP ${res.status}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(out, buf);
  console.log(`✅ کتاب ${book} → ${out} (${(buf.length / 1024 / 1024).toFixed(2)}MB) از ${files.pdfPath}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("💥 خطا:", e);
  process.exit(1);
});
