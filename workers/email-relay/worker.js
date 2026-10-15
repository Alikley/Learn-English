// ============================================================
// Flex English — Email Relay Worker (v1.0.0 / English 1.0.1.11)
//
// چرا این Worker وجود دارد؟
//  SendGrid درخواست‌های API از IP کشورهای تحریمی (از جمله
//  ایران) را با کد HTTP 451 رد می‌کند — حتی وقتی کلید و
//  فرستنده کاملاً سالم‌اند. اگر سایت شما روی «سرور داخل ایران»
//  یا هاست ایرانی با دامنهٔ .ir باشد، ایمیل بازیابی رمز هرگز
//  نمی‌رسد (خطای 451). روی Vercel این مشکل نیست (IP سالم است).
//
// راه‌حل: این Worker رایگانِ Cloudflare به‌عنوان «رلهٔ ایمیل»:
//   سرور شما (هر IP، حتی ایران)  →  این Worker (IP سالم Cloudflare)
//   →  api.sendgrid.com → ایمیل تحویل می‌شود ✔
//  سرور شما فقط به Cloudflare وصل می‌شود که از ایران بدون VPN
//  در دسترس است. کاربر نهایی هم فقط ایمیلش را در Gmail/Yahoo
//  می‌بیند — ربطی به VPN کاربر ندارد.
//
// استقرار (۵ دقیقه، رایگان — جزئیات کامل در DEPLOY.md و .env):
//  ۱) dash.cloudflare.com → Workers & Pages → Create Worker
//     → نام: flex-english-email-relay → Deploy
//  ۲) «Edit code» → کل این فایل را جای‌گذاری → Save and Deploy
//  ۳) Settings → Variables and Secrets → Add (نوع Secret):
//        RELAY_KEY            = یک رشتهٔ تصادفی (مثلاً openssl rand -hex 16)
//        SENDGRID_API_KEY     = همان SG.xxx خودتان
//        SENDGRID_FROM_EMAIL  = همان فرستندهٔ Verified خودتان
//        SENDGRID_FROM_NAME   = Flex English   (اختیاری)
//  ۴) آدرس Worker (https://…workers.dev) + همان RELAY_KEY را در
//     .env اپ بگذارید:  EMAIL_RELAY_URL و EMAIL_RELAY_KEY
//
// مسیرها:
//   GET  /health → زنده‌بودن (بدون کلید — برای تست سریع)
//                  curl https://…workers.dev/health
//   GET  /verify → با هدر X-Relay-Key — درستی کلید + تنظیم‌بودن SendGrid
//   POST /send   → با هدر X-Relay-Key — ارسال ایمیل
//                  body: {"to","subject","text","html","fromName"?}
//   (POST / هم مثل /send کار می‌کند تا URL ساده‌تر باشد)
//
// امنیت:
//  - بدون X-Relay-Key درست، هیچ ایمیلی ارسال نمی‌شود (401)
//    → کسی که آدرس Worker را پیدا کند نمی‌تواند سوءاستفاده کند
//  - محدودیت سرعت: هر IP حداکثر ۳۰ ارسال در دقیقه
//  - «from» فقط از Secret خود Worker می‌آید — caller نمی‌تواند
//    فرستندهٔ جعلی بگذارد
//  - سقف حجم بدنه/متن/HTML (ایمیل بازیابی ~۳KB است؛ سقف‌ها خوش‌بینانه‌اند)
//  - مقایسهٔ کلید به‌صورت constant-time (نشان‌دادن زمانی کمتر)
//
// محدودیت پلن رایگان Cloudflare: ۱۰۰,۰۰۰ درخواست در روز —
//  برای ایمیل بازیابی رمز عملاً بی‌نهایت است.
//
// فایل مستقل است: بدون پکیج، بدون بیلد — کپی/جای‌گذاری در
// داشبورد کافی است. (wrangler.toml فقط برای استقرار با CLI است.)
// ============================================================

const RELAY_VERSION = "1.0.0";

/** آدرس API ارسال SendGrid ( SENDGRID_API_URL فقط برای تست داخلی override می‌شود) */
const SENDGRID_SEND_URL_DEFAULT = "https://api.sendgrid.com/v3/mail/send";
/** تایم‌اوت ارسال به SendGrid */
const UPSTREAM_TIMEOUT_MS = 10_000;
/** حداکثر طول بدنهٔ درخواست (کاراکتر) */
const MAX_BODY_CHARS = 64_000;
/** حداکثر طول subject / fromName / text / html */
const MAX_SUBJECT = 500;
const MAX_FROM_NAME = 100;
const MAX_TEXT = 50_000;
const MAX_HTML = 60_000;
/** محدودیت سرعت: n درخواست در پنجرهٔ ۶۰ ثانیه‌ای به ازای هر IP */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── ابزارها ──

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** مقایسهٔ امن (constant-time) — طول متفاوت = نابرابر */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ── محدودیت سرعت (در حافظهٔ همان isolate — best-effort) ──

const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  // جلوگیری از بزرگ‌شدن بی‌نهایت حافظه
  if (hits.size > 5000) hits.clear();
  return false;
}

// ── هدر X-Relay-Key ──

function relayKeyFrom(request) {
  return request.headers.get("x-relay-key") || "";
}

/** آیا Worker خودش SendGrid را تنظیم دارد؟ */
function workerSendgridReady(env) {
  return Boolean(env && env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL);
}

// ── مسیرها ──

function handleHealth(env) {
  return json({
    ok: true,
    service: "flex-english-email-relay",
    version: RELAY_VERSION,
    // فقط «تنظیم شده/نشده» — هیچ مقدار کلیدی لو نمی‌رود
    sendgridConfigured: workerSendgridReady(env),
  });
}

function handleVerify(request, env) {
  if (!env || !env.RELAY_KEY) {
    return json(
      {
        ok: false,
        error:
          "Worker تنظیم نشده: متغیر RELAY_KEY در Settings → Variables and Secrets (به‌صورت Secret) اضافه کنید",
      },
      500,
    );
  }
  if (!safeEqual(relayKeyFrom(request), env.RELAY_KEY)) {
    return json(
      {
        ok: false,
        error:
          "کلید رله (هدر X-Relay-Key) غلط است — مقدار EMAIL_RELAY_KEY در اپ باید عیناً با RELAY_KEY این Worker یکی باشد",
      },
      401,
    );
  }
  return json({
    ok: true,
    service: "flex-english-email-relay",
    version: RELAY_VERSION,
    sendgridConfigured: workerSendgridReady(env),
  });
}

async function handleSend(request, env) {
  const startedAt = Date.now();

  // ۱) احراز کلید
  if (!env || !env.RELAY_KEY) {
    return json(
      {
        ok: false,
        error:
          "Worker تنظیم نشده: متغیر RELAY_KEY در Settings → Variables and Secrets (به‌صورت Secret) اضافه کنید",
      },
      500,
    );
  }
  if (!safeEqual(relayKeyFrom(request), env.RELAY_KEY)) {
    return json(
      {
        ok: false,
        error:
          "کلید رله (هدر X-Relay-Key) غلط یا فراموش شده — مقدار EMAIL_RELAY_KEY در اپ باید عیناً با RELAY_KEY این Worker یکی باشد",
      },
      401,
    );
  }

  // ۲) SendGrid در Worker تنظیم شده؟
  if (!workerSendgridReady(env)) {
    return json(
      {
        ok: false,
        error:
          "Worker تنظیم نشده: SENDGRID_API_KEY و SENDGRID_FROM_EMAIL را در Settings → Variables and Secrets (به‌صورت Secret) اضافه کنید",
      },
      500,
    );
  }

  // ۳) بدنهٔ درخواست
  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return json({ ok: false, error: "بدنهٔ درخواست قابل خواندن نبود" }, 400);
  }
  if (raw.length > MAX_BODY_CHARS) {
    return json(
      { ok: false, error: `بدنهٔ درخواست بزرگ است (سقف ${MAX_BODY_CHARS} کاراکتر)` },
      413,
    );
  }
  let body = {};
  try {
    body = JSON.parse(raw);
  } catch {
    return json(
      { ok: false, error: "بدنهٔ درخواست JSON معتبر نیست" },
      400,
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "بدنهٔ درخواست باید یک object باشد" }, 400);
  }

  // ۴) اعتبارسنجی فیلدها (اِرث‌بری امن — فقط نوع string پذیرفته)
  const to = String(body.to || "").trim();
  if (!EMAIL_RE.test(to)) {
    return json(
      { ok: false, error: `گیرنده (to) معتبر نیست: «${to.slice(0, 100)}»` },
      400,
    );
  }
  const subject = String(body.subject || "").trim();
  if (!subject || subject.length > MAX_SUBJECT) {
    return json(
      { ok: false, error: `subject لازم است و حداکثر ${MAX_SUBJECT} کاراکتر` },
      400,
    );
  }
  const text = String(body.text || "");
  const html = String(body.html || "");
  if (!text && !html) {
    return json({ ok: false, error: "text یا html (یا هر دو) لازم است" }, 400);
  }
  if (text.length > MAX_TEXT || html.length > MAX_HTML) {
    return json(
      { ok: false, error: `text/html بزرگ است (سقف: ${MAX_TEXT}/${MAX_HTML})` },
      413,
    );
  }
  // نام نمایشی فرستنده: از درخواست فقط به‌عنوانِ «نام» پذیرفته
  // می‌شود؛ آدرس from همیشه از Secret خود Worker می‌آید (ضد جعل)
  const fromName =
    String(body.fromName || "").trim().slice(0, MAX_FROM_NAME) ||
    String(env.SENDGRID_FROM_NAME || "").trim() ||
    "Flex English";

  // ۵) ارسال از SendGrid (با IP سالم Cloudflare)
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: env.SENDGRID_FROM_EMAIL, name: fromName },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
  };

  const sendUrl = env.SENDGRID_API_URL || SENDGRID_SEND_URL_DEFAULT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const detail = await res.text().catch(() => "");
    if (res.ok) {
      // SendGrid موفق = 202 Accepted
      return json({
        ok: true,
        status: res.status,
        via: "cloudflare-worker",
        relayLatencyMs: Date.now() - startedAt,
      });
    }
    return json({
      ok: false,
      status: res.status,
      error: `SendGrid ${res.status}: ${(detail || "(بدون جزئیات)").slice(0, 300)}`,
    });
  } catch (e) {
    const aborted = e && e.name === "AbortError";
    return json({
      ok: false,
      error: aborted
        ? `پاسخی از SendGrid نگرفتیم (تایم‌اوت ${UPSTREAM_TIMEOUT_MS / 1000} ثانیه)`
        : `خطای شبکه در تماس با SendGrid: ${e && e.message ? e.message : String(e)}`,
    });
  } finally {
    clearTimeout(timer);
  }
}

// ── روتر اصلی ──

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    // حذف اسلش آخر → «/» و «/send/» و «/send» یکی باشند
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    if (method === "GET" && (path === "/" || path === "/health")) {
      return handleHealth(env);
    }
    if (method === "GET" && path === "/verify") {
      return handleVerify(request, env);
    }
    if (method === "POST" && (path === "/" || path === "/send")) {
      const ip =
        request.headers.get("cf-connecting-ip") ||
        (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
        "unknown";
      if (rateLimited(ip)) {
        return json(
          {
            ok: false,
            error: `درخواست‌های زیاد از همین IP — حداکثر ${RATE_LIMIT} ارسال در دقیقه`,
          },
          429,
        );
      }
      return handleSend(request, env);
    }
    return json(
      {
        ok: false,
        error: `مسیر/متد پشتیبانی نمی‌شود: ${method} ${path} — مسیرها: GET /health · GET /verify · POST /send`,
      },
      404,
    );
  },
};

export default worker;
