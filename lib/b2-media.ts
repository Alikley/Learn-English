// ========================================
// اتصال Backblaze B2 — نسخه ۱.۰.۲.۸
// فایل‌های صوتی و کتاب‌ها از باکت خصوصی B2
// سرو می‌شوند؛ لینک‌ها «امضادار» و محدود به
// دامنه‌های مجاز هستند (بدون لینک عمومی دائمی).
//
// متغیرهای محیطی لازم:
//   B2_KEY_ID      — شناسه کلید اپلیکیشن B2
//   B2_APP_KEY     — کلید مخفی اپلیکیشن B2
//   B2_BUCKET      — نام باکت (پیش‌فرض: english-media-assets)
//   MEDIA_ALLOWED_ORIGINS — دامنه‌های مجاز جدا با کاما
// ========================================

const B2_KEY_ID = process.env.B2_KEY_ID ?? "";
const B2_APP_KEY = process.env.B2_APP_KEY ?? "";
export const B2_BUCKET = process.env.B2_BUCKET ?? "english-media-assets";

const AUTH_API = "https://api.backblazeb2.com/b2api/v2";

// توکن اکانت: ۲۴ ساعت اعتبار → تازه‌سازی در ۲۳ ساعت
const AUTH_TTL_MS = 23 * 60 * 60 * 1000;
// توکن دانلود: حداکثر ۷ روز اعتبار → تازه‌سازی در ۶ روز
const DOWNLOAD_TTL_S = 7 * 24 * 60 * 60;
const DOWNLOAD_TTL_MS = 6 * 24 * 60 * 60 * 1000;

type AccountAuth = {
  token: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
  expiresAt: number;
};

type DownloadAuth = { token: string; expiresAt: number };

// کش در سطح ماژول — در سرور گرم فقط هر ۶ روز یک
// بار درخواست توکن جدید زده می‌شود
let accountAuth: AccountAuth | null = null;
let downloadAuth: DownloadAuth | null = null;

/** آیا کلیدهای B2 تنظیم شده‌اند؟ */
export function isMediaConfigured(): boolean {
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

/** توکن دانلود امضادار (محدود به کل باکت، اعتبار ۷ روز) */
async function getDownloadToken(): Promise<string> {
  if (downloadAuth && Date.now() < downloadAuth.expiresAt) {
    return downloadAuth.token;
  }

  const bucketId = await getBucketId();
  const data = await callB2("b2_get_download_authorization", {
    bucketId,
    fileNamePrefix: "",
    validDurationInSeconds: DOWNLOAD_TTL_S,
  });

  downloadAuth = {
    token: data.authorizationToken as string,
    expiresAt: Date.now() + DOWNLOAD_TTL_MS,
  };
  return downloadAuth.token;
}

let cachedBucketId: string | null = null;

async function getBucketId(): Promise<string> {
  if (cachedBucketId) return cachedBucketId;

  const auth = await authorize();
  const data = await callB2("b2_list_buckets", { accountId: auth.accountId });
  const buckets = data.buckets as Array<{ bucketName: string; bucketId: string }>;
  const found = buckets.find((b) => b.bucketName === B2_BUCKET);
  if (!found) throw new Error(`B2 bucket not found: ${B2_BUCKET}`);

  cachedBucketId = found.bucketId;
  return cachedBucketId;
}

/**
 * ساخت لینک امضادار برای یک فایل باکت.
 * مسیر نسبت به ریشه باکت است، مثل:
 *   audio/listening/listening-beginner-02/story.mp3
 */
export async function signedMediaUrl(remotePath: string): Promise<string> {
  const token = await getDownloadToken();
  const auth = await authorize();
  const encoded = remotePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${auth.downloadUrl}/file/${B2_BUCKET}/${encoded}?Authorization=${token}`;
}
