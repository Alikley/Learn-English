// ========================================
// اتصال Backblaze B2 — باکت «cambridge» (v1.0.3.3)
//
// کاربر ۸ کتاب کمبریج (PDF + فایل‌های صوتی) را روی B2
// آپلود کرده است. این ماژول «خودشان را پیدا می‌کند»:
//
//  ۱) باکت اختصاصی: نام دقیق از env B2_CAMBRIDGE_BUCKET
//     (پیش‌فرض «cambridge») — با تطبیق انعطاف‌پذیر:
//     دقیق → بدون حساسیت به حروف → شامل «cambridge»
//  ۲) اگر باکت اختصاصی نبود: پوشهٔ cambridge/ داخل باکت
//     اصلی رسانه‌ها (english-media-assets) بررسی می‌شود
//
// سپس فایل‌ها بر اساس شمارهٔ کتاب (۱..۸) گروه‌بندی می‌شوند:
//  - PDF هر کتاب = بزرگ‌ترین فایل pdf آن کتاب
//  - فایل‌های صوتی = مرتب‌شدهٔ طبیعی (شماره‌فهم)
//
// همهٔ پاسخ‌ها ۵ دقیقه کش می‌شوند؛ ?refresh=1 کش را می‌شکند.
// این ماژول فقط سمت سرور استفاده می‌شود.
//
// متغیرهای محیطی (همان کلیدهای 1.0.2.8):
//   B2_KEY_ID, B2_APP_KEY            — کلیدهای اکانت B2
//   B2_CAMBRIDGE_BUCKET              — پیش‌فرض: cambridge
// ========================================

const B2_KEY_ID = process.env.B2_KEY_ID ?? "";
const B2_APP_KEY = process.env.B2_APP_KEY ?? "";
const B2_CAMBRIDGE_BUCKET = process.env.B2_CAMBRIDGE_BUCKET ?? "cambridge";
const MAIN_BUCKET = process.env.B2_BUCKET ?? "english-media-assets";

const AUTH_API = "https://api.backblazeb2.com/b2api/v2";

const AUTH_TTL_MS = 23 * 60 * 60 * 1000; // توکن اکانت: ۲۴س → تازه‌سازی ۲۳س
const DOWNLOAD_TTL_S = 7 * 24 * 60 * 60; // توکن دانلود: حداکثر ۷ روز
const DOWNLOAD_TTL_MS = 6 * 24 * 60 * 60 * 1000;
const LIST_TTL_MS = 5 * 60 * 1000; // کش فهرست فایل‌ها: ۵ دقیقه
const BUCKETS_TTL_MS = 10 * 60 * 1000; // کش فهرست باکت‌ها: ۱۰ دقیقه

// ---------- انواع ----------

type AccountAuth = {
  token: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
  expiresAt: number;
};

type B2Bucket = { bucketName: string; bucketId: string };

type B2File = { fileName: string; contentLength: number };

export type CambridgeSource = "bucket" | "main-prefix";

export type CambridgeBookFiles = {
  pdfPath: string | null;
  pdfSize: number;
  audioFiles: string[];
};

export type CambridgeScan = {
  configured: boolean;
  source: CambridgeSource | null;
  bucketName: string | null;
  books: Record<number, CambridgeBookFiles>;
  unmatchedFiles: number;
  totalFiles: number;
  error: string | null;
};

// ---------- کش‌های سطح ماژول ----------

let accountAuth: AccountAuth | null = null;
let bucketsCache: { list: B2Bucket[]; expiresAt: number } | null = null;
const downloadTokens = new Map<string, { token: string; expiresAt: number }>();
let scanCache: { scan: CambridgeScan; expiresAt: number } | null = null;

// ---------- احراز هویت اکانت ----------

function isCambridgeConfigured(): boolean {
  return B2_KEY_ID !== "" && B2_APP_KEY !== "";
}

async function authorize(): Promise<AccountAuth> {
  if (accountAuth && Date.now() < accountAuth.expiresAt) return accountAuth;

  const basic = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString("base64");
  const res = await fetch(`${AUTH_API}/b2_authorize_account`, {
    headers: { Authorization: `Basic ${basic}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`B2 authorize failed: ${res.status}`);
  const data = (await res.json()) as {
    authorizationToken: string;
    apiUrl: string;
    downloadUrl: string;
    accountId: string;
  };

  accountAuth = {
    token: data.authorizationToken,
    apiUrl: data.apiUrl,
    downloadUrl: data.downloadUrl.replace(/\/+$/, ""),
    accountId: data.accountId,
    expiresAt: Date.now() + AUTH_TTL_MS,
  };
  return accountAuth;
}

async function callB2(path: string, body: unknown): Promise<Record<string, unknown>> {
  const auth = await authorize();
  const res = await fetch(`${auth.apiUrl}/b2api/v2/${path}`, {
    method: "POST",
    headers: { Authorization: auth.token },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`B2 ${path} failed: ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

// ---------- فهرست باکت‌ها ----------

async function listBuckets(): Promise<B2Bucket[]> {
  if (bucketsCache && Date.now() < bucketsCache.expiresAt) return bucketsCache.list;

  const auth = await authorize();
  const data = await callB2("b2_list_buckets", { accountId: auth.accountId });
  const buckets = (data.buckets as B2Bucket[]) ?? [];

  bucketsCache = { list: buckets, expiresAt: Date.now() + BUCKETS_TTL_MS };
  return buckets;
}

/** یافتن باکت cambridge با تطبیق انعطاف‌پذیر */
async function resolveCambridgeBucket(): Promise<B2Bucket | null> {
  const buckets = await listBuckets();
  const target = B2_CAMBRIDGE_BUCKET.toLowerCase();

  const exact = buckets.find((b) => b.bucketName === B2_CAMBRIDGE_BUCKET);
  if (exact) return exact;

  const ci = buckets.find((b) => b.bucketName.toLowerCase() === target);
  if (ci) return ci;

  return (
    buckets.find((b) => b.bucketName.toLowerCase().includes("cambridge")) ?? null
  );
}

// ---------- فهرست فایل‌ها ----------

async function listFiles(
  bucketId: string,
  prefix: string,
): Promise<B2File[]> {
  const out: B2File[] = [];
  let startAfter: string | undefined;

  // حداکثر ۱۰ صفحه (۱۰٬۰۰۰ فایل) — خیلی بیشتر از نیاز واقعی
  for (let page = 0; page < 10; page++) {
    const body: Record<string, unknown> = {
      bucketId,
      maxFileCount: 1000,
      prefix,
    };
    if (startAfter) body.startFileName = startAfter;

    const data = await callB2("b2_list_file_names", body);
    const files = (data.files as B2File[]) ?? [];
    out.push(...files);

    const next = data.nextFileName;
    if (typeof next !== "string" || files.length === 0) break;
    startAfter = next;
  }

  return out;
}

// ---------- گروه‌بندی فایل‌ها بر اساس شمارهٔ کتاب ----------

const AUDIO_EXT = new Set([".mp3", ".m4a", ".wav", ".aac", ".ogg", ".wma", ".flac"]);

/** استخراج شمارهٔ کتاب (۱..۸) از کلید فایل */
function extractBookNumber(key: string): number | null {
  // ۱) عدد ابتدای کلید: «1/...»، «1.pdf»، «1 - test.mp3»
  const lead = key.match(/^(\d{1,2})(?![\d])/);
  if (lead) {
    const n = Number(lead[1]);
    if (n >= 1 && n <= 8) return n;
    return null; // عدد ابتدایی خارج از ۱..۸ → متعلق به هیچ کتابی
  }
  // ۲) اولین عدد داخل کلید: «book 2.pdf»، «cam3 audio»
  const any = key.match(/(\d{1,2})/);
  if (any) {
    const n = Number(any[1]);
    if (n >= 1 && n <= 8) return n;
  }
  return null;
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

/**
 * گروه‌بندی فایل‌ها برای ۸ کتاب.
 * مسیر کامل (نسبت به ریشهٔ باکت) حفظ می‌شود تا روت media
 * بتواند همان را سرو کند.
 */
export function groupCambridgeFiles(
  files: B2File[],
  source: CambridgeSource,
): { books: Record<number, CambridgeBookFiles>; unmatched: number } {
  const books: Record<number, CambridgeBookFiles> = {};
  for (let n = 1; n <= 8; n++) {
    books[n] = { pdfPath: null, pdfSize: 0, audioFiles: [] };
  }
  let unmatched = 0;

  const pdfs: Record<number, B2File[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };

  for (const f of files) {
    const fileName = f.fileName;

    // برای حالت main-prefix پیشوند cambridge را جدا می‌کنیم
    let rel = fileName;
    if (source === "main-prefix") {
      rel = fileName.replace(/^cambridge[\/\-_ ]*/i, "");
      if (!rel) rel = fileName;
    }

    // کلید = اولین قطعهٔ مسیر (یا کل نام فایل)
    const firstSlash = rel.indexOf("/");
    const key = (firstSlash === -1 ? rel : rel.slice(0, firstSlash)).trim();
    if (!key) {
      unmatched++;
      continue;
    }

    const bookNum = extractBookNumber(key);
    if (bookNum === null) {
      unmatched++;
      continue;
    }

    const dot = fileName.lastIndexOf(".");
    const ext = dot === -1 ? "" : fileName.slice(dot).toLowerCase();

    if (ext === ".pdf") {
      pdfs[bookNum].push(f);
    } else if (AUDIO_EXT.has(ext)) {
      books[bookNum].audioFiles.push(fileName);
    }
    // بقیهٔ پسوندها نادیده گرفته می‌شوند (تصاویر، زیپ و...)
  }

  // PDF هر کتاب = بزرگ‌ترین فایل pdf آن (PDF اصلی کتاب، نه پیوست‌ها)
  for (let n = 1; n <= 8; n++) {
    const list = pdfs[n];
    if (list.length === 0) continue;
    const best = list.reduce((a, b) => (b.contentLength > a.contentLength ? b : a));
    books[n].pdfPath = best.fileName;
    books[n].pdfSize = best.contentLength;
    books[n].audioFiles.sort(naturalCompare);
  }
  for (let n = 1; n <= 8; n++) {
    books[n].audioFiles.sort(naturalCompare);
  }

  return { books, unmatched };
}

// ---------- اسکن کامل ----------

const EMPTY_SCAN: CambridgeScan = {
  configured: false,
  source: null,
  bucketName: null,
  books: {},
  unmatchedFiles: 0,
  totalFiles: 0,
  error: null,
};

/**
 * اسکن کامل باکت کمبریج (کش ۵ دقیقه).
 * force=true کش را می‌شکند (برای دکمهٔ «اسکن مجدد»).
 */
export async function scanCambridge(force = false): Promise<CambridgeScan> {
  if (!isCambridgeConfigured()) {
    return { ...EMPTY_SCAN };
  }
  if (!force && scanCache && Date.now() < scanCache.expiresAt) {
    return scanCache.scan;
  }

  try {
    const camBucket = await resolveCambridgeBucket();

    let source: CambridgeSource;
    let bucket: B2Bucket;
    let prefix: string;
    if (camBucket) {
      source = "bucket";
      bucket = camBucket;
      prefix = "";
    } else {
      // باکت اختصاصی نیست → پوشهٔ cambridge/ داخل باکت اصلی
      const buckets = await listBuckets();
      const main = buckets.find((b) => b.bucketName === MAIN_BUCKET);
      if (!main) throw new Error(`B2 bucket not found: ${MAIN_BUCKET} / ${B2_CAMBRIDGE_BUCKET}`);
      source = "main-prefix";
      bucket = main;
      prefix = "cambridge";
    }

    const files = await listFiles(bucket.bucketId, prefix);
    const { books, unmatched } = groupCambridgeFiles(files, source);

    const scan: CambridgeScan = {
      configured: true,
      source,
      bucketName: bucket.bucketName,
      books,
      unmatchedFiles: unmatched,
      totalFiles: files.length,
      error: null,
    };
    scanCache = { scan, expiresAt: Date.now() + LIST_TTL_MS };
    return scan;
  } catch (error) {
    const message = error instanceof Error ? error.message : "B2 scan failed";
    const scan: CambridgeScan = {
      configured: true,
      source: null,
      bucketName: null,
      books: {},
      unmatchedFiles: 0,
      totalFiles: 0,
      error: message,
    };
    return scan;
  }
}

// ---------- لینک امضادار ----------

async function getBucketIdByName(bucketName: string): Promise<string> {
  const buckets = await listBuckets();
  const found = buckets.find((b) => b.bucketName === bucketName);
  if (!found) throw new Error(`B2 bucket not found: ${bucketName}`);
  return found.bucketId;
}

async function getDownloadToken(bucketName: string): Promise<string> {
  const cached = downloadTokens.get(bucketName);
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  const bucketId = await getBucketIdByName(bucketName);
  const data = await callB2("b2_get_download_authorization", {
    bucketId,
    fileNamePrefix: "",
    validDurationInSeconds: DOWNLOAD_TTL_S,
  });

  downloadTokens.set(bucketName, {
    token: data.authorizationToken as string,
    expiresAt: Date.now() + DOWNLOAD_TTL_MS,
  });
  return data.authorizationToken as string;
}

/**
 * ساخت لینک امضادار برای یک فایل باکت کمبریج.
 * مسیر نسبت به ریشهٔ همان باکت است (مثل «2/IELTS 2.pdf»).
 */
export async function signedCambridgeUrl(
  bucketName: string,
  remotePath: string,
): Promise<string> {
  const token = await getDownloadToken(bucketName);
  const auth = await authorize();
  const encoded = remotePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${auth.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encoded}?Authorization=${token}`;
}

export { isCambridgeConfigured };
