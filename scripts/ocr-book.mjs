#!/usr/bin/env node
// ========================================
// اسکریپت آفلاین OCR کتاب‌های کمبریج — نسخهٔ ویندوز (v1.0.9.0 / English 1.0.2.8)
//
//   node scripts/ocr-book.mjs <شماره کتاب> [گزینه‌ها]
//   node scripts/ocr-book.mjs 16
//   node scripts/ocr-book.mjs 16 --dpi 300 --jobs 2
//   node scripts/ocr-book.mjs --list          ← فهرست PDFهای شناخته‌شده
//
// چی می‌کند؟
//  ۱) PDF کتاب را پیدا می‌کند — اول پوشهٔ محلی IELTS_PDF_DIR، بعد
//     باکت B2 (همان منطق lib/b2-cambridge.ts: باکت «cambridge» یا
//     پوشهٔ cambridge/ داخل باکت اصلی — PDF هر کتاب = بزرگ‌ترین
//     فایل pdf آن شماره)
//  ۲) هر صفحه را با 300 DPI (پیش‌فرض) به تصویر PNG رندر می‌کند
//  ۳) متن هر صفحه را با Tesseract انگلیسی OCR می‌گیرد
//  ۴) پیشرفت را در ترمینال نشان می‌دهد و قابل-ادامه (resume) است —
//     اگر وسط کار قطع شد، دوباره همان دستور را بزنید؛ صفحه‌های
//     انجام‌شده دوباره OCR نمی‌شوند
//  ۵) خروجی: فایل «<نام همان PDF>.ocr.json» — آرایه‌ای از رشته‌ها،
//     متن هر صفحه به ترتیب صفحات (دقیقاً همان فرمتی که getBookPages
//     برمی‌گرداند)
//
// 🪟 ویندوز — بدون هیچ ابزار سیستمی:
//    فقط Node.js 20+ لازم است. هر سه پکیج (tesseract.js،
//    @napi-rs/canvas، pdfjs-dist) به‌صورت prebuilt نصب می‌شوند —
//    نه poppler می‌خواهد، نه ImageMagick، نه هیچ چیز دیگری.
//    (اسکریپت روی لینوکس/مک هم همین‌طور کار می‌کند.)
//
// 📦 نصب (یک بار، داخل پوشهٔ پروژه):
//    npm install
//    (سه پکیج بالا از قبل در package.json ثبت شده‌اند)
//
// 🌐 فقط «بار اول» اینترنت لازم است: Tesseract دادهٔ زبان انگلیسی
//    (~12MB) را دانلود و در پوشهٔ .tesseract-cache نگه می‌دارد؛
//    اجراهای بعدی کاملاً آفلاین‌اند. دانلود PDF از B2 هم البته
//    اینترنت می‌خواهد — با گزینهٔ --pdf <مسیر> می‌توانید از فایل
//    محلی استفاده کنید و کلاً آفلاین بمانید.
//
// 📤 بعد از اتمام، دقیقاً می‌گوید فایل را کجا بگذارید:
//    کنار خود PDF — پوشهٔ محلی (IELTS_PDF_DIR) یا باکت B2 —
//    از آن لحظه getBookPages کتاب را از همین فایل می‌خواند
//    (v1.0.9.0: «OCR sidecar») و ساخت برگهٔ AI فعال می‌شود.
//
// گزینه‌ها:
//   --pdf <مسیر>     مسیر مستقیم فایل PDF (دور زدن جست‌وجو)
//   --out <پوشه>     پوشهٔ خروجی (پیش‌فرض: کنار خود PDF)
//   --dpi <عدد>      کیفیت رندر — پیش‌فرض 300 (200 هم برای تست سریع
//                    خوب است؛ 300 برای متن ریز کتاب‌های کمبریج توصیه می‌شود)
//   --jobs <عدد>     تعداد workerهای موازی OCR — پیش‌فرض 2
//   --from <صفحه>    شروع از صفحهٔ N (پیش‌فرض 1)
//   --to <صفحه>      پایان در صفحهٔ N (پیش‌فرض: آخرین صفحه)
//   --lang <کد>      زبان Tesseract — پیش‌فرض eng
//   --allow-low-confidence  خروجی را حتی با صفحه‌های نیازمند بازبینی بساز
//   --list           فقط فهرست کتاب‌های پیداشده را نشان بده
//
// متغیرهای محیطی (از .env / .env.local پوشهٔ پروژه هم خوانده می‌شوند):
//   IELTS_PDF_DIR        پوشهٔ PDFهای محلی (مثل D:\ielts-books)
//   B2_KEY_ID            کلید اکانت Backblaze B2
//   B2_APP_KEY           کلید مخفی اکانت B2
//   B2_CAMBRIDGE_BUCKET  نام باکت کمبریج (پیش‌فرض cambridge)
//   B2_BUCKET            باکت اصلی رسانه‌ها (پیش‌فرض english-media-assets)
// ========================================

import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import os from "node:os";

// — وابستگی‌ها (پکیج‌های prebuilt — بدون ابزار سیستمی) —
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";

// ---------- ابزارهای خط فرمان ----------

const ARGS = process.argv.slice(2);

function arg(name, fallback) {
  const i = ARGS.indexOf(`--${name}`);
  if (i === -1 || i + 1 >= ARGS.length) return fallback;
  return ARGS[i + 1];
}

function hasFlag(name) {
  return ARGS.includes(`--${name}`);
}

// ---------- بارگذاری .env / .env.local (بدون وابستگی) ----------

function loadEnvFile(filePath) {
  try {
    if (!existsSync(filePath)) return;
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (line.trim().startsWith("#")) continue;
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(m[1] in process.env)) process.env[m[1]] = value;
    }
  } catch {
    /* فایل .env اختیاری است */
  }
}

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
for (const envName of [".env.local", ".env"]) {
  loadEnvFile(path.join(PROJECT_ROOT, envName));
}

// ---------- ثابت‌ها ----------

const IELTS_BOOK_COUNT = 21; // همان محدودهٔ lib/b2-cambridge.ts
const AUTH_API = "https://api.backblazeb2.com/b2api/v2";
const MIN_OCR_CONFIDENCE = 70;

const B2_KEY_ID = (process.env.B2_KEY_ID ?? "").trim();
const B2_APP_KEY = (process.env.B2_APP_KEY ?? "").trim();
const B2_CAMBRIDGE_BUCKET = (process.env.B2_CAMBRIDGE_BUCKET ?? "cambridge").trim();
const B2_MAIN_BUCKET = (process.env.B2_BUCKET ?? "english-media-assets").trim();

// ---------- کمکی‌ها ----------

function fmt(n) {
  return n.toLocaleString("en-US");
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}m${String(r).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`;
}

// همان نام‌های ممکنی که lib/ielts/pdf-text.ts بررسی می‌کند
function localPdfCandidates(bookNumber) {
  const dir = (process.env.IELTS_PDF_DIR ?? "").trim();
  if (!dir) return [];
  const names = [
    `${bookNumber}.pdf`,
    `book${bookNumber}.pdf`,
    `book-${bookNumber}.pdf`,
    `cambridge${bookNumber}.pdf`,
    `cambridge-${bookNumber}.pdf`,
    `ielts${bookNumber}.pdf`,
    `ielts-${bookNumber}.pdf`,
    String(bookNumber).padStart(2, "0") + ".pdf",
    `book${String(bookNumber).padStart(2, "0")}.pdf`,
  ];
  return names.map((n) => path.join(dir, n));
}

// ---------- B2 — همان منطق lib/b2-cambridge.ts ----------

async function b2Authorize() {
  const basic = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString("base64");
  const res = await fetch(`${AUTH_API}/b2_authorize_account`, {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) {
    throw new Error(
      `احراز هویت B2 ناموفق بود (HTTP ${res.status}) — B2_KEY_ID / B2_APP_KEY را چک کنید`,
    );
  }
  return res.json();
}

async function b2Call(auth, apiPath, body) {
  const res = await fetch(`${auth.apiUrl}/b2api/v2/${apiPath}`, {
    method: "POST",
    headers: { Authorization: auth.authorizationToken },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`B2 ${apiPath} ناموفق بود (HTTP ${res.status})`);
  }
  return res.json();
}

async function b2ListBuckets(auth) {
  const data = await b2Call(auth, "b2_list_buckets", { accountId: auth.accountId });
  return data.buckets ?? [];
}

/** یافتن باکت کمبریج با همان تطبیق انعطاف‌پذیر b2-cambridge.ts */
function resolveCambridgeBucket(buckets) {
  const target = B2_CAMBRIDGE_BUCKET.toLowerCase();
  const exact = buckets.find((b) => b.bucketName === B2_CAMBRIDGE_BUCKET);
  if (exact) return { bucket: exact, prefix: "" };
  const ci = buckets.find((b) => b.bucketName.toLowerCase() === target);
  if (ci) return { bucket: ci, prefix: "" };
  const fuzzy = buckets.find((b) => b.bucketName.toLowerCase().includes("cambridge"));
  if (fuzzy) return { bucket: fuzzy, prefix: "" };
  const main = buckets.find((b) => b.bucketName === B2_MAIN_BUCKET);
  if (main) return { bucket: main, prefix: "cambridge" };
  return null;
}

async function b2ListFiles(auth, bucketId, prefix) {
  const out = [];
  let startAfter;
  for (let page = 0; page < 10; page++) {
    const body = { bucketId, maxFileCount: 1000, prefix };
    if (startAfter) body.startFileName = startAfter;
    const data = await b2Call(auth, "b2_list_file_names", body);
    const files = data.files ?? [];
    out.push(...files);
    const next = data.nextFileName;
    if (typeof next !== "string" || files.length === 0) break;
    startAfter = next;
  }
  return out;
}

/** استخراج شمارهٔ کتاب از کلید فایل — همان extractBookNumber در b2-cambridge.ts */
function extractBookNumber(key) {
  const lead = key.match(/^(\d{1,2})(?![\d])/);
  if (lead) {
    const n = Number(lead[1]);
    return n >= 1 && n <= IELTS_BOOK_COUNT ? n : null;
  }
  const any = key.match(/(\d{1,2})/);
  if (any) {
    const n = Number(any[1]);
    return n >= 1 && n <= IELTS_BOOK_COUNT ? n : null;
  }
  return null;
}

/** گروه‌بندی فایل‌ها بر اساس شمارهٔ کتاب — PDF هر کتاب = بزرگ‌ترین فایل pdf */
function groupBooks(files, prefix) {
  const books = {};
  for (const f of files) {
    let rel = f.fileName;
    if (prefix) {
      rel = rel.replace(/^cambridge[\/\-_ ]*/i, "");
      if (!rel) rel = f.fileName;
    }
    const firstSlash = rel.indexOf("/");
    const key = (firstSlash === -1 ? rel : rel.slice(0, firstSlash)).trim();
    if (!key) continue;
    const bookNum = extractBookNumber(key);
    if (bookNum === null) continue;
    if (!books[bookNum]) books[bookNum] = { pdf: null, audio: 0 };
    if (f.fileName.toLowerCase().endsWith(".pdf")) {
      if (!books[bookNum].pdf || f.contentLength > books[bookNum].pdf.contentLength) {
        books[bookNum].pdf = f;
      }
    } else {
      books[bookNum].audio++;
    }
  }
  return books;
}

async function b2Download(auth, bucketName, bucketId, fileName) {
  const dl = await b2Call(auth, "b2_get_download_authorization", {
    bucketId,
    fileNamePrefix: "",
    validDurationInSeconds: 604800,
  });
  const encoded = fileName
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  const url = `${auth.downloadUrl.replace(/\/+$/, "")}/file/${encodeURIComponent(bucketName)}/${encoded}?Authorization=${dl.authorizationToken}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`دانلود «${fileName}» از B2 ناموفق بود (HTTP ${res.status})`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ---------- پیدا کردن PDF کتاب ----------

/**
 * خروجی:
 *   { buffer, fileName, origin: "local"|"b2", localPath: string|null, b2: {bucketName, key} | null }
 */
async function findBookPdf(bookNumber, explicitPdf) {
  // ۱) مسیر مستقیم
  if (explicitPdf) {
    const abs = path.resolve(explicitPdf);
    if (!existsSync(abs)) {
      throw new Error(`فایل پیدا نشد: ${abs}`);
    }
    return {
      buffer: await readFile(abs),
      fileName: path.basename(abs),
      origin: "local",
      localPath: abs,
      b2: null,
    };
  }

  // ۲) پوشهٔ محلی IELTS_PDF_DIR
  for (const candidate of localPdfCandidates(bookNumber)) {
    try {
      const info = await stat(candidate);
      if (info.isFile() && info.size > 1000) {
        return {
          buffer: await readFile(candidate),
          fileName: path.basename(candidate),
          origin: "local",
          localPath: candidate,
          b2: null,
        };
      }
    } catch {
      /* این نام نیست — نام بعدی */
    }
  }

  // ۳) باکت B2
  if (!B2_KEY_ID || !B2_APP_KEY) {
    throw new Error(
      `PDF کتاب ${bookNumber} پیدا نشد.\n` +
        `  • IELTS_PDF_DIR تنظیم نیست (یا فایل ${bookNumber}.pdf / book${bookNumber}.pdf در آن نیست)\n` +
        `  • کلیدهای B2 هم تنظیم نیستند — در .env بگذارید: B2_KEY_ID و B2_APP_KEY\n` +
        `  یا مسیر مستقیم بدهید: node scripts/ocr-book.mjs ${bookNumber} --pdf "C:\\path\\to\\book.pdf"`,
    );
  }

  const auth = await b2Authorize();
  const buckets = await b2ListBuckets(auth);
  const resolved = resolveCambridgeBucket(buckets);
  if (!resolved) {
    throw new Error(
      `نه باکت «${B2_CAMBRIDGE_BUCKET}» پیدا شد و نه باکت اصلی «${B2_MAIN_BUCKET}» — نام باکت را چک کنید`,
    );
  }
  const files = await b2ListFiles(auth, resolved.bucket.bucketId, resolved.prefix);
  const books = groupBooks(files, resolved.prefix);
  const entry = books[bookNumber]?.pdf;
  if (!entry) {
    throw new Error(
      `PDF کتاب ${bookNumber} در باکت «${resolved.bucket.bucketName}» پیدا نشد — با --list فهرست کتاب‌های موجود را ببینید`,
    );
  }
  const buffer = await b2Download(auth, resolved.bucket.bucketName, resolved.bucket.bucketId, entry.fileName);
  return {
    buffer,
    fileName: entry.fileName.split("/").pop(),
    origin: "b2",
    localPath: null,
    b2: { bucketName: resolved.bucket.bucketName, key: entry.fileName },
  };
}

// ---------- رندر صفحه با pdfjs-dist + @napi-rs/canvas ----------

let pdfDoc = null;

// 🔑 pdfjs-dist در Node به‌طور پیش‌فرض برای بوم‌های موقتش سراغ پکیج
// «node-canvas» می‌رود — مخلوط‌شدن آن با @napi-rs/canvas به خطای
// segfault می‌رسد. با دادن این کارخانه، همهٔ بوم‌ها از
// @napi-rs/canvas ساخته می‌شوند و همه‌چیز پایدار می‌ماند.
// (pdfjs-dist نسخهٔ ۴ پارامتر «CanvasFactory» می‌گیرد: یک «کلاس»، نه نمونه)
class NapiRsCanvasFactory {
  constructor({ ownerDocument = null, enableHWA = false } = {}) {
    this._ownerDocument = ownerDocument;
    this._enableHWA = enableHWA;
  }
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function openPdf(buffer) {
  const params = {
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    CanvasFactory: NapiRsCanvasFactory,
  };
  // فونت‌های استاندارد pdf.js — برای کتاب‌های اسکن تصویری لازم نیست،
  // ولی برای PDFهای متنی رندر تمیزتری می‌دهد (best-effort)
  const standardFonts = path.join(
    PROJECT_ROOT,
    "node_modules",
    "pdfjs-dist",
    "standard_fonts",
  );
  if (existsSync(standardFonts)) {
    params.standardFontDataUrl = new URL(
      `${pathToFileURL(standardFonts).href.replace(/\/$/, "")}/`,
    ).href;
  }
  pdfDoc = await pdfjs.getDocument(params).promise;
  return pdfDoc;
}

async function renderPagePng(pageNumber, dpi) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: dpi / 72 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const png = canvas.toBuffer("image/png");
  page.cleanup();
  return png;
}

// ---------- متن صفحه — پاک‌سازی سبک ----------

function cleanPageText(text) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

// ---------- اجرای اصلی ----------

async function listBooks() {
  console.log("📚 فهرست PDFهای کتاب‌های کمبریج\n");
  const dir = (process.env.IELTS_PDF_DIR ?? "").trim();
  if (dir) {
    console.log(`پوشهٔ محلی (IELTS_PDF_DIR): ${dir}`);
    let found = 0;
    for (let n = 1; n <= IELTS_BOOK_COUNT; n++) {
      const hit = localPdfCandidates(n).find((p) => existsSync(p));
      if (hit) {
        found++;
        console.log(`  کتاب ${n}: ${hit}`);
      }
    }
    if (!found) console.log("  (هیچ فایلی با الگوی شناخته‌شده پیدا نشد)");
  } else {
    console.log("IELTS_PDF_DIR تنظیم نشده — سراغ B2 می‌رویم");
  }
  if (B2_KEY_ID && B2_APP_KEY) {
    console.log(`\nباکت B2 (B2_CAMBRIDGE_BUCKET=${B2_CAMBRIDGE_BUCKET}):`);
    try {
      const auth = await b2Authorize();
      const buckets = await b2ListBuckets(auth);
      const resolved = resolveCambridgeBucket(buckets);
      if (!resolved) {
        console.log("  باکت کمبریج/اصلی پیدا نشد");
      } else {
        console.log(`  منبع: باکت «${resolved.bucket.bucketName}»${resolved.prefix ? ` / پوشهٔ ${resolved.prefix}` : ""}`);
        const files = await b2ListFiles(auth, resolved.bucket.bucketId, resolved.prefix);
        const books = groupBooks(files, resolved.prefix);
        for (const n of Object.keys(books).map(Number).sort((a, b) => a - b)) {
          const pdf = books[n].pdf;
          if (pdf) {
            console.log(
              `  کتاب ${n}: ${pdf.fileName} (${(pdf.contentLength / 1048576).toFixed(1)} MB)`,
            );
          }
        }
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
  } else {
    console.log("\n(کلیدهای B2 تنظیم نیستند — فقط پوشهٔ محلی بررسی شد)");
  }
}

async function main() {
  // بررسی Node.js
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 18) {
    console.error(`❌ Node.js ${process.versions.node} قدیمی است — نسخهٔ 20 یا بالاتر را نصب کنید (nodejs.org)`);
    process.exit(1);
  }
  if (major < 20) {
    console.warn(`⚠️ Node.js ${process.versions.node} — نسخهٔ 20+ توصیه می‌شود`);
  }

  if (hasFlag("list")) {
    await listBooks();
    return;
  }

  const book = Number(ARGS[0]);
  if (!Number.isInteger(book) || book < 1 || book > IELTS_BOOK_COUNT) {
    console.error(
      `استفاده: node scripts/ocr-book.mjs <شماره کتاب ۱..${IELTS_BOOK_COUNT}> [گزینه‌ها]\n` +
        `مثال:  node scripts/ocr-book.mjs 16\n` +
        `فهرست: node scripts/ocr-book.mjs --list`,
    );
    process.exit(1);
  }

  const dpi = Math.max(72, Math.min(600, Number(arg("dpi", "300"))));
  const lang = arg("lang", "eng");
  const jobs = Math.max(1, Math.min(8, Number(arg("jobs", String(Math.min(2, os.cpus().length))))));
  const from = Math.max(1, Number(arg("from", "1")));
  const explicitPdf = arg("pdf");
  const outDirArg = arg("out");

  console.log(`📖 کتاب ${book} — DPI: ${dpi} — زبان OCR: ${lang} — workerها: ${jobs}`);
  console.log("   در حال پیدا کردن PDF…");

  const pdf = await findBookPdf(book, explicitPdf);
  const pdfLabel =
    pdf.origin === "b2" ? `B2 ← ${pdf.b2.bucketName}/${pdf.b2.key}` : pdf.fileName;
  console.log(`✅ PDF پیدا شد: ${pdfLabel} (${(pdf.buffer.length / 1048576).toFixed(1)} MB)`);

  await openPdf(pdf.buffer);
  const total = pdfDoc.numPages;
  const to = Math.min(total, Number(arg("to", String(total))));
  if (from > to) {
    console.error(`❌ --from ${from} بعد از --to ${to} است`);
    process.exit(1);
  }
  console.log(`📄 صفحات: ${total} (پردازش ${from}..${to})`);

  // ---------- خروجی و resume ----------
  // پیش‌فرض: کنار خود PDF محلی (تا سرور همان‌جا پیدایش کند)؛ برای B2: پوشهٔ جاری
  const outDir = path.resolve(
    outDirArg ??
      (pdf.origin === "b2"
        ? process.cwd()
        : pdf.localPath
          ? path.dirname(pdf.localPath)
          : process.cwd()),
  );
  await mkdir(outDir, { recursive: true });
  const baseName = pdf.fileName; // مثل «16.pdf» یا «IELTS 16.pdf»
  const primaryOut = path.join(outDir, `${baseName}.ocr.json`);
  const shortOut =
    path.join(outDir, `${baseName.replace(/\.pdf$/i, "")}.ocr.json`) === primaryOut
      ? null
      : path.join(outDir, `${baseName.replace(/\.pdf$/i, "")}.ocr.json`);
  const partialPath = path.join(outDir, `.${book}.ocr.partial.json`);

  /** صفحات انجام‌شده — اندیس 0-based؛ null = هنوز OCR نشده */
  let done = new Array(total).fill(null);
  let confidences = new Array(total).fill(null);
  if (existsSync(partialPath)) {
    try {
      const saved = JSON.parse(await readFile(partialPath, "utf8"));
      const compatible =
        saved.book === book &&
        saved.pdf === baseName &&
        saved.dpi === dpi &&
        saved.lang === lang &&
        Array.isArray(saved.pages) &&
        saved.pages.length === total;
      if (compatible) {
        done = saved.pages.map((p) => (typeof p === "string" ? p : null));
        if (
          Array.isArray(saved.confidences) &&
          saved.confidences.length === total
        ) {
          confidences = saved.confidences.map((value) =>
            Number.isFinite(value) ? value : null,
          );
        } else {
          console.log("ℹ️ فایل ادامهٔ قبلی امتیاز اطمینان ندارد؛ صفحه‌های قبلی دوباره بررسی می‌شوند");
        }
        const already = done.filter(
          (page, i) =>
            page != null &&
            page.trim().length > 0 &&
            confidences[i] != null &&
            confidences[i] >= MIN_OCR_CONFIDENCE,
        ).length;
        console.log(`⏩ ادامه از اجرای قبلی: ${already} صفحه با اطمینان کافی آماده است`);
      } else {
        console.warn("⚠️ فایل ادامه با کتاب/تنظیمات فعلی سازگار نیست؛ OCR از نو شروع می‌شود");
      }
    } catch (error) {
      console.warn(`⚠️ فایل ادامه خوانده نشد؛ OCR از نو شروع می‌شود: ${error.message}`);
    }
  }

  // ---------- Tesseract ----------
  console.log("🧠 در حال آماده‌سازی Tesseract (بار اول دادهٔ زبان را دانلود می‌کند)…");
  const cachePath = path.join(PROJECT_ROOT, ".tesseract-cache");
  const workers = [];
  for (let i = 0; i < jobs; i++) {
    const worker = await createWorker(lang, 1, { cachePath });
    await worker.setParameters({ tessedit_pageseg_mode: "3" });
    workers.push(worker);
  }

  const startedAt = Date.now();
  let completed = 0;
  let totalChars = 0;
  let skipped = 0;
  const inRange = to - from + 1;

  // صفحات از پیش انجام‌شده را بشمار
  for (let i = from - 1; i < to; i++) {
    if (
      done[i] != null &&
      done[i].trim().length > 0 &&
      confidences[i] != null &&
      confidences[i] >= MIN_OCR_CONFIDENCE
    ) {
      completed++;
      totalChars += done[i].length;
      skipped++;
    }
  }

  let nextIdx = from - 1;
  const progressLine = () => {
    const pct = ((completed / inRange) * 100).toFixed(1).padStart(5);
    const elapsed = Date.now() - startedAt;
    const perPage = completed > skipped ? elapsed / (completed - skipped) : 0;
    const remaining = inRange - completed;
    const eta = perPage > 0 ? ` | ETA: ${fmtDuration(perPage * remaining)}` : "";
    process.stdout.write(
      `\r[${String(completed).padStart(String(inRange).length, " ")}/${inRange}] ${pct}% | مجموع: ${fmt(totalChars)} کاراکتر${eta}   `,
    );
  };

  async function savePartial() {
    const payload = JSON.stringify({
      book,
      dpi,
      lang,
      pdf: baseName,
      pages: done,
      confidences,
    });
    await writeFile(partialPath, payload, "utf8");
  }

  // هر worker حلقهٔ خودش را دارد تا یک worker هم‌زمان به دو صفحه اختصاص نیابد.
  const loops = [];
  for (let w = 0; w < jobs; w++) {
    loops.push(
      (async () => {
        while (true) {
          const i = nextIdx++;
          if (i >= to) break;
          if (
            done[i] != null &&
            done[i].trim().length > 0 &&
            confidences[i] != null &&
            confidences[i] >= MIN_OCR_CONFIDENCE
          ) {
            continue;
          }

          const worker = workers[w];
          const png = await renderPagePng(i + 1, dpi);
          const first = await worker.recognize(png);
          let bestText = cleanPageText(first.data.text);
          let bestConfidence = Number.isFinite(first.data.confidence)
            ? first.data.confidence
            : 0;

          if (bestConfidence < MIN_OCR_CONFIDENCE || !bestText) {
            const retryDpi = Math.min(600, Math.max(dpi + 1, Math.round(dpi * 1.5)));
            const retryPng = await renderPagePng(i + 1, retryDpi);
            await worker.setParameters({ tessedit_pageseg_mode: "11" });
            let retry;
            try {
              retry = await worker.recognize(retryPng);
            } finally {
              await worker.setParameters({ tessedit_pageseg_mode: "3" });
            }

            const retryText = cleanPageText(retry.data.text);
            const retryConfidence = Number.isFinite(retry.data.confidence)
              ? retry.data.confidence
              : 0;
            if (
              retryConfidence > bestConfidence ||
              (retryConfidence === bestConfidence && retryText.length > bestText.length)
            ) {
              bestText = retryText;
              bestConfidence = retryConfidence;
            }
          }

          done[i] = bestText;
          confidences[i] = bestConfidence;
          completed++;
          totalChars += bestText.length;
          if (bestConfidence < MIN_OCR_CONFIDENCE || !bestText) {
            console.warn(
              `\n⚠️ صفحهٔ ${i + 1} نیازمند بازبینی است (اطمینان ${bestConfidence.toFixed(1)}%)`,
            );
          }
          progressLine();
          if (completed % 5 === 0) await savePartial();
        }
      })(),
    );
  }

  try {
    const results = await Promise.allSettled(loops);
    const failed = results.find((result) => result.status === "rejected");
    if (failed) throw failed.reason;
  } finally {
    try {
      await savePartial();
    } finally {
      try {
        await Promise.all(workers.map((worker) => worker.terminate()));
      } finally {
        if (typeof pdfDoc?.cleanup === "function") {
          await pdfDoc.cleanup();
        }
      }
    }
  }

  process.stdout.write("\n");

  const missingPages = done
    .map((page, i) => (page == null ? i + 1 : null))
    .filter((page) => page != null);
  if (missingPages.length > 0) {
    console.error(
      `❌ فقط صفحه‌های ${from}..${to} پردازش شدند؛ خروجی نهایی ساخته نشد تا صفحات ناقص خالی ثبت نشوند. فایل ادامه حفظ شد: ${partialPath}`,
    );
    process.exitCode = 1;
    return;
  }

  const reviewPages = done
    .map((page, i) =>
      !page.trim() || confidences[i] == null || confidences[i] < MIN_OCR_CONFIDENCE
        ? i + 1
        : null,
    )
    .filter((page) => page != null);
  if (reviewPages.length > 0 && !hasFlag("allow-low-confidence")) {
    console.error(
      `❌ خروجی نهایی ساخته نشد: ${reviewPages.length} صفحه اطمینان کافی ندارند (${reviewPages.join(", ")}). این صفحه‌ها دوباره با وضوح بالاتر OCR شدند و در فایل ادامه ذخیره‌اند. پس از بازبینی می‌توانید با --allow-low-confidence خروجی را بسازید.`,
    );
    process.exitCode = 1;
    return;
  }
  if (reviewPages.length > 0) {
    console.warn(
      `⚠️ خروجی با وجود صفحه‌های نیازمند بازبینی ساخته می‌شود: ${reviewPages.join(", ")}`,
    );
  }

  // ---------- خروجی نهایی ----------
  const pages = done;
  const json = JSON.stringify(pages);
  await writeFile(primaryOut, json, "utf8");
  if (shortOut) {
    await writeFile(shortOut, json, "utf8");
  }
  try {
    await unlink(partialPath);
  } catch {
    /* partial حذف نشد — مهم نیست */
  }

  const duration = Date.now() - startedAt;
  console.log("");
  console.log(
    `✅ کتاب ${book} تمام شد — ${total} صفحه / ${fmt(totalChars)} کاراکتر — مدت: ${fmtDuration(duration)}${skipped ? ` (${skipped} صفحه از اجرای قبلی)` : ""}`,
  );
  console.log(`📁 فایل خروجی: ${primaryOut}`);
  if (shortOut) console.log(`📁 (نسخهٔ دوم): ${shortOut}`);

  // ---------- راهنمای آپلود ----------
  if (pdf.origin === "b2" && pdf.b2) {
    console.log("");
    console.log("📤 این فایل را در باکت B2 «کنار خود PDF» آپلود کنید:");
    console.log(`   باکت: ${pdf.b2.bucketName}`);
    console.log(`   کلید: ${pdf.b2.key}.ocr.json`);
    console.log(`   (نسخهٔ دوم با این کلید هم شناخته می‌شود: ${pdf.b2.key.replace(/\.pdf$/i, "")}.ocr.json)`);
    console.log("   از آن لحظه getBookPages این کتاب را از همین فایل می‌خواند — بدون تغییر کد یا ری‌دیپلوی.");
  } else {
    console.log("");
    console.log("📤 این فایل را کنار همان PDF محلی بگذارید (همین پوشه) — getBookPages خودکار پیدا می‌کندش.");
    console.log("   برای استفاده روی سرور: فایل PDF و همین .ocr.json را با هم در IELTS_PDF_DIR بگذارید،");
    console.log("   یا هر دو را در باکت B2 کنار هم آپلود کنید.");
  }
  console.log("");
  console.log("🧪 تست سریع (روی همان سروری که IELTS_PDF_DIR/B2 دارد):");
  console.log(`   curl "http://localhost:3000/api/ielts/paper?bookId=${book}&testId=1&skill=listening"`);
}

main().catch((err) => {
  console.error(`\n❌ ${err.message ?? err}`);
  process.exit(1);
});
