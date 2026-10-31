// ========================================
// ساخت لایهٔ متنی OCR برای یک کتابِ اسکن‌شدهٔ کمبریج (v1.0.8.8)
//
//   bun scripts/ocr-book.ts <شماره کتاب> [--pdf <مسیر>] [--out <پوشه>] [--dpi 130] [--from 1] [--to 999]
//
// چی می‌کند؟
//  ۱) PDF کتاب را از B2 (یا IELTS_PDF_DIR یا --pdf) می‌گیرد
//  ۲) هر صفحه را با pdftoppm به تصویر JPEG تبدیل می‌کند
//  ۳) تصویر هر صفحه را به یک «سرویس AI دیداری» می‌فرستد و متنِ
//     دقیق صفحه را می‌گیرد (OCR با کیفیتِ مدل زبانی — بهتر از tesseract)
//  ۴) نتیجه را به‌صورت data/ocr/cambridge/<n>.json می‌نویسد —
//     از آن لحظه getBookPages این کتاب را خودکار از OCR می‌خواند و
//     «ساخت برگهٔ هوش مصنوعی» برایش فعال می‌شود (مثل کتاب ۱۰ همین نسخه)
//
// ملزومات:
//  - poppler-utils (برنامهٔ pdftoppm):
//      Ubuntu/Debian:  sudo apt install poppler-utils
//      macOS (brew):   brew install poppler
//      Windows:        دانلود poppler و افزودن به PATH
//  - یک سرویس AI دیداریِ سازگار با OpenAI (چت + تصویر) در .env:
//      AI_VISION_API_KEY=sk-...
//      AI_VISION_BASE_URL=https://api.openai.com/v1   (یا سرویس دیگر)
//      AI_VISION_MODEL=gpt-4o                          (یا claude-sonnet-4 و…)
//    نکته: دیپ‌سیک مدل تصویری ندارد — این کلید باید از سرویس دیگری
//    باشد (CodeCraft، OpenAI، OpenRouter و…). OUTBOUND_PROXY_URL هم
//    اگر تنظیم باشد برای این تماس‌ها استفاده می‌شود.
//
// قابل-ادامه است: اگر وسط کار قطع شد، دوباره همان دستور را بزنید —
// صفحه‌های انجام‌شده (در tmp) دوباره OCR نمی‌شوند.
// ========================================

import { execFile } from "node:child_process";
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { scanCambridge, signedCambridgeUrl } from "../lib/b2-cambridge";
import { outboundRequest } from "../lib/outbound-proxy";
import { localPdfDir } from "../lib/ielts/pdf-text";

const execFileP = promisify(execFile);

const PROMPT = `You are a precise OCR engine. Transcribe ALL text on this scanned exam page exactly as printed.
Rules:
- Plain text only — NO markdown symbols (no **, *, #).
- Reading order: top to bottom; for two-column areas, left column fully then right column.
- Keep line breaks. Keep every heading (TEST 1, LISTENING, SECTION 1, READING, WRITING, Answer keys, etc.).
- Keep question numbers exactly. Multiple-choice options: one per line (e.g. "A London").
- Tables/forms/notes: flatten to text lines, separate columns with " | ", use "___" for blanks.
- Transcribe the printed page number only if it appears alone at the top or bottom edge.
- If the page is blank or has almost no text, output exactly: [EMPTY]
Output ONLY the transcription.`;

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

async function main() {
  const book = Number(process.argv[2]?.replace(/^--/, ""));
  if (!Number.isInteger(book) || book < 1) {
    console.log("استفاده: bun scripts/ocr-book.ts <شماره کتاب> [--pdf <مسیر>] [--out <پوشه>] [--dpi 130] [--from 1] [--to 999]");
    process.exit(1);
  }
  const dpi = Number(arg("dpi", "130"));
  const from = Number(arg("from", "1"));
  const toArg = Number(arg("to", "999999"));
  const outDir = arg("out") ?? path.join(process.cwd(), "data", "ocr", "cambridge");
  const apiKey = (process.env.AI_VISION_API_KEY ?? "").trim();
  const baseUrl = (process.env.AI_VISION_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const model = (process.env.AI_VISION_MODEL ?? "gpt-4o").trim();
  if (!apiKey || !baseUrl) {
    console.log(
      "❌ سرویس AI دیداری تنظیم نشده — در .env این سه متغیر را بگذارید:\n   AI_VISION_API_KEY=sk-...\n   AI_VISION_BASE_URL=https://api.openai.com/v1\n   AI_VISION_MODEL=gpt-4o\nنکته: دیپ‌سیک مدل تصویری ندارد؛ از CodeCraft/OpenAI/OpenRouter و… استفاده کنید.",
    );
    process.exit(1);
  }

  // ---------- ۱) پیدا کردن PDF ----------
  let pdfPath = arg("pdf");
  if (!pdfPath) {
    const candidates = [
      path.join(process.cwd(), `${book}.pdf`),
      path.join(process.cwd(), "data", "ielts", `${book}.pdf`),
      localPdfDir() ? path.join(localPdfDir()!, `${book}.pdf`) : null,
    ].filter((p): p is string => Boolean(p) && existsSync(p as string));
    if (candidates.length > 0) pdfPath = candidates[0];
  }
  if (!pdfPath) {
    console.log(`[۱/۴] دانلود PDF کتاب ${book} از باکت B2...`);
    const scan = await scanCambridge();
    if (!scan.configured || scan.error) {
      console.log(`❌ B2 پیکربندی نشده (${scan.error ?? "?"}) و فایل محلی هم پیدا نشد — یا کلیدهای B2 را بگذارید یا --pdf <مسیر> بدهید`);
      process.exit(1);
    }
    const files = scan.books[book];
    if (!files?.pdfPath) {
      console.log(`❌ PDF کتاب ${book} در باکت نیست — کتاب‌های موجود: ${Object.keys(scan.books).join(", ")}`);
      process.exit(1);
    }
    const dl = path.join(os.tmpdir(), `flex-ocr-book-${book}.pdf`);
    const url = await signedCambridgeUrl(scan.bucketName!, files.pdfPath);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.log(`❌ دانلود از B2 ناموفق: HTTP ${res.status}`);
      process.exit(1);
    }
    await writeFile(dl, Buffer.from(await res.arrayBuffer()));
    pdfPath = dl;
  }
  console.log(`[۱/۴] PDF: ${pdfPath} (${((await stat(pdfPath)).size / 1024 / 1024).toFixed(1)}MB)`);

  // ---------- ۲) رندر صفحات ----------
  try {
    await execFileP("pdftoppm", ["-v"]);
  } catch {
    console.log(
      "❌ برنامهٔ pdftoppm پیدا نشد — poppler-utils را نصب کنید:\n   Ubuntu/Debian: sudo apt install poppler-utils\n   macOS: brew install poppler\n   Windows: poppler را دانلود و به PATH اضافه کنید",
    );
    process.exit(1);
  }
  const imgDir = path.join(os.tmpdir(), `flex-ocr-img-${book}`);
  await mkdir(imgDir, { recursive: true });
  const existingImgs = (await readdir(imgDir)).filter((f) => f.endsWith(".jpg"));
  if (existingImgs.length === 0) {
    console.log(`[۲/۴] رندر صفحات با ${dpi} DPI...`);
    await execFileP("pdftoppm", [
      "-r", String(dpi), "-jpeg", "-jpegopt", "quality=82", pdfPath, path.join(imgDir, "p"),
    ]);
  }
  const images = (await readdir(imgDir)).filter((f) => f.endsWith(".jpg")).sort();
  if (images.length === 0) {
    console.log("❌ هیچ صفحه‌ای رندر نشد");
    process.exit(1);
  }
  console.log(`[۲/۴] ${images.length} صفحه آماده است`);

  // ---------- ۳) OCR صفحه‌به‌صفحه ----------
  const partsDir = path.join(os.tmpdir(), `flex-ocr-parts-${book}`);
  await mkdir(partsDir, { recursive: true });
  const fromIdx = Math.max(0, from - 1);
  const toIdx = Math.min(images.length, toArg);
  const todo: number[] = [];
  for (let i = fromIdx; i < toIdx; i++) {
    const part = path.join(partsDir, `page-${String(i).padStart(3, "0")}.json`);
    if (!existsSync(part)) todo.push(i);
  }
  console.log(`[۳/۴] OCR با مدل ${model} — ${todo.length} صفحه مانده (از ${toIdx - fromIdx} صفحهٔ بازه)`);
  let done = 0;
  let failed = 0;
  const t0 = Date.now();
  for (const idx of todo) {
    const img = await readFile(path.join(imgDir, images[idx]));
    const b64 = img.toString("base64");
    let text = "";
    for (let attempt = 1; attempt <= 4 && !text; attempt++) {
      const r = await outboundRequest(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: PROMPT },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } },
              ],
            },
          ],
        }),
        timeoutMs: 120_000,
      });
      if (r.kind === "http" && r.ok) {
        try {
          text = (JSON.parse(r.bodyText).choices?.[0]?.message?.content ?? "") as string;
        } catch {
          text = "";
        }
      } else if (r.kind === "http") {
        const hint = r.status === 401 ? "کلید نامعتبر است" : r.status === 402 ? "اعتبار سرویس تمام شده" : r.status === 404 ? "آدرس یا مدل پیدا نشد" : r.status === 429 ? "محدودیت نرخ — صبر می‌کنیم" : "";
        if (attempt === 4) console.error(`  صفحه ${idx + 1}: HTTP ${r.status} ${hint}`);
        await new Promise((res) => setTimeout(res, r.status === 429 ? 20000 : 4000));
      } else {
        if (attempt === 4) console.error(`  صفحه ${idx + 1}: خطای شبکه — ${r.error.slice(0, 100)}`);
        await new Promise((res) => setTimeout(res, 4000));
      }
    }
    if (!text) {
      failed++;
      continue;
    }
    await writeFile(path.join(partsDir, `page-${String(idx).padStart(3, "0")}.json`), JSON.stringify({ page: idx, text }));
    done++;
    const el = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`  [${el}s] صفحه ${idx + 1}/${images.length} ✓ (${text.length} کاراکتر)`);
  }

  // ---------- ۴) ادغام و ذخیره ----------
  const parts = (await readdir(partsDir)).filter((f) => f.endsWith(".json")).sort();
  if (parts.length === 0) {
    console.log(`❌ هیچ صفحه‌ای OCR نشد (${failed} خطا)`);
    process.exit(1);
  }
  const pages: string[] = [];
  for (const f of parts) {
    const d = JSON.parse(await readFile(path.join(partsDir, f), "utf8")) as { page: number; text: string };
    pages[d.page] = d.text;
  }
  for (let i = 0; i < images.length; i++) if (!pages[i]) pages[i] = "";
  const total = pages.reduce((a, p) => a + (p ?? "").length, 0);
  if (total < 5000) {
    console.log(`❌ متن نهایی خیلی کم است (${total} کاراکتر) — خروجی نوشته نشد`);
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${book}.json`);
  await writeFile(
    outPath,
    JSON.stringify({ book, engine: `${model} (vision OCR) — scripts/ocr-book.ts`, pages }, null, 0),
  );
  console.log(
    `[۴/۴] ✅ ${path.relative(process.cwd(), outPath) || outPath} ساخته شد — ${pages.length} صفحه / ${total} کاراکتر` +
      (failed > 0 ? ` (${failed} صفحه خطا خورد و خالی ماند — دوباره اجرا کنید تا همان‌ها کامل شود)` : ""),
  );
  console.log("از این لحظه «برگهٔ هوش مصنوعی» و «پاسخ‌نامه» این کتاب فعال است — نیازی به تغییر کد نیست.");
  process.exit(failed > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error("💥 خطا:", e);
  process.exit(1);
});
