// فهرست کتاب‌های باکت + وضعیت لایهٔ متنی هر کتاب
import { scanCambridge, signedCambridgeUrl } from "../lib/b2-cambridge";
import { writeFile, mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";

async function main() {
  const from = Number(process.argv[2] ?? 1);
  const to = Number(process.argv[3] ?? 99);
  const dir = "/tmp/books";
  await mkdir(dir, { recursive: true });
  const scan = await scanCambridge();
  if (!scan.configured || scan.error) {
    console.log(`❌ B2: ${scan.error ?? "?"}`);
    process.exit(1);
  }
  const books = Object.keys(scan.books)
    .map(Number)
    .filter((n) => n >= from && n <= to && scan.books[n]?.pdfPath)
    .sort((a, b) => a - b);
  console.log(`کتاب‌های ${from}..${to} با PDF: ${books.join(", ")}`);
  for (const n of books) {
    const out = path.join(dir, `${n}.pdf`);
    try {
      await writeFile(out, Buffer.alloc(0), { flag: "a" }); // ensure exists
      const size = Number(execSync(`stat -c%s '${out}'`).toString());
      if (size < 2000) {
        const url = await signedCambridgeUrl(scan.bucketName!, scan.books[n].pdfPath!);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.log(`${n}: ❌ دانلود HTTP ${res.status}`);
          continue;
        }
        await writeFile(out, Buffer.from(await res.arrayBuffer()));
      }
      const info = execSync(`pdfinfo '${out}' | grep -i '^Pages'`).toString().trim();
      const pages = Number(info.split(":")[1]);
      // متن ۳۰ صفحهٔ میانی — اگر اسکن باشد، تقریباً صفر است
      const mid = Math.max(1, Math.min(30, Math.floor(pages / 3)));
      const chars = execSync(
        `pdftotext -f ${mid} -l ${Math.min(pages, mid + 29)} '${out}' - 2>/dev/null | tr -d ' \\n\\r' | wc -c`,
      ).toString().trim();
      const verdict = Number(chars) > 5000 ? "TEXT ✅" : "SCANNED ❌";
      console.log(`book ${n}: ${pages} صفحه, ${chars} کاراکتر (صفحات ${mid}-${Math.min(pages, mid + 29)}) → ${verdict}`);
    } catch (e) {
      console.log(`book ${n}: ⚠️ ${(e as Error).message?.slice(0, 100)}`);
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
