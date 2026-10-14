// ========================================
// v1.0.6.7 (English 1.0.1.10) — لایهٔ «پروکسی خروجی» سرور
//
// چرا این فایل وجود دارد؟
//  Twilio/SendGrid درخواست‌های API از IP کشورهای تحریمی (از
//  جمله ایران) را با کد HTTP 451 «Unavailable For Legal Reasons»
//  رد می‌کند — حتی وقتی کلید و فرستنده کاملاً سالم‌اند (این
//  مورد روی اکانت واقعی این پروژه اثبات شد: همان درخواست از
//  IP خارجی → 202 موفق). مرورگرِ کاربر از VPN رد می‌شود ولی
//  Node پراکسی سیستم ویندوز را نادیده می‌گیرد و مستقیم می‌رود.
//
// راه‌حل: env اختیاری OUTBOUND_PROXY_URL (socks5 یا http) —
//  درخواست‌های سرورِ ایمیل (SendGrid) و پوش (OneSignal) در صورت
//  تنظیم بودن، از همان تونل VPN می‌گذرند.
//   v2rayN :  socks5://127.0.0.1:10808  یا  http://127.0.0.1:10809
//   Hiddify:  socks5://127.0.0.1:12334
//   Clash  :  http://127.0.0.1:7890
//
// v1.0.6.7 — «شکست‌ناپذیری» لایهٔ پروکسی (گزارش واقعی ۱.۰.1.9):
//  کاربر OUTBOUND_PROXY_URL را گذاشت ولی VPN لحظهٔ ارسال خاموش
//  بود → connect ECONNREFUSED 127.0.0.1:10808 → ایمیل نرفت.
//  حالا قبل از هر ارسال، «پروبِ در دسترس» انجام می‌شود (اتصال TCP
//  سبک با تایم‌اوت کوتاه، نتیجه کش می‌شود):
//   - پروکسی خاموش/قطع → خودکار «مستقیم» ارسال می‌شود + یک هشدار
//     روشن در لاگ سرور (اپ هرگز به‌خاطر پروکسیِ خاموش نمی‌شکند)
//   - پروکسی روشن → درخواست از تونل می‌رود؛ اگر وسط راه اتصالِ
//     پروکسی قطع شد (خطای قبل از ارسال)، یک‌بار مستقیم تلاش می‌شود
//   - OUTBOUND_PROXY_URL خالی/نامعتبر = کاملاً بی‌اثر: همان fetch
//     قبلی، همان رفتار، همان تایم‌اوت (و روی Vercel که IP سالم
//     دارد، لازم هم نیست)
//  برای تستِ مستقیمِ اجباری هم forceDirect هست (مسیر «direct» در
//  روت تشخیص خودکار از آن استفاده می‌کند).
//
// طراحی:
//  - معتبر = درخواست با https.request خام + Agent (SocksProxyAgent
//    یا HttpsProxyAgent) — همان الگویی که openid-client هم استفاده
//    می‌کند؛ fetch برای SOCKS پروکسی Agent نمی‌پذیرد.
//  - همهٔ خروجی‌ها از نوع OutboundResult؛ خطای شبکه هرگز throw
//    نمی‌شود.
//  - فیلد via فقط وقتی پروکسی تنظیم شده باشد در نتیجه می‌آید
//    (بدون پروکسی، خروجی عیناً شکل قبلی است).
// ========================================

import https from "node:https";
import net from "node:net";
import type { Agent as NodeHttpAgent, ClientRequest } from "node:http";

const DEFAULT_TIMEOUT_MS = 10_000;
/** سقف اندازهٔ بدنهٔ پاسخ که می‌خوانیم (جلوگیری از حافظهٔ بی‌پایان) */
const MAX_BODY_CHARS = 200_000;

// ── پروبِ پروکسی (v1.0.6.7) ──
/** تایم‌اوت اتصالِ آزمایشی به پروکسی (کوتاه — نباید کاربر را معطل کند) */
const PROBE_TIMEOUT_MS = 800;
/** نتیجهٔ «روشن» چقدر معتبر بماند (بعدش دوباره پروب می‌شود) */
const PROBE_UP_TTL_MS = 60_000;
/** نتیجهٔ «خاموش» چقدر معتبر بماند (اگر VPN روشن شد، زود دوباره چک شود) */
const PROBE_DOWN_TTL_MS = 20_000;

export type ProxyKind = "socks" | "http" | "invalid";

export type ProxyClass = {
  kind: ProxyKind;
  /** socks | socks4 | socks4a | socks5 | socks5h | http | https */
  scheme?: string;
  reason?: string;
};

export type OutboundRequest = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  /** v1.0.6.7 — مستقیم بفرست، حتی اگر OUTBOUND_PROXY_URL تنظیم شده باشد */
  forceDirect?: boolean;
};

export type OutboundResult =
  | {
      kind: "http";
      ok: boolean;
      status: number;
      bodyText: string;
      /** فقط وقتی OUTBOUND_PROXY_URL تنظیم شده باشد در پاسخ هست */
      via?: "proxy" | "direct";
    }
  | {
      kind: "network-error";
      error: string;
      /** کد خطای Node (مثل ECONNREFUSED) — برای تشخیص مرحلهٔ اتصال */
      code?: string;
      via?: "proxy" | "direct";
    };

/** نتیجهٔ پروبِ در دسترس‌بودن پروکسی */
export type ProxyProbe = {
  reachable: boolean;
  /** جزئیات کوتاه برای لاگ/تشخیص (بدون credential) */
  detail: string;
  checkedAt: number;
};

/** آدرس پروکسی خروجی از env — خالی = مستقیم (رفتار قبلی) */
export function getOutboundProxyUrl(): string | undefined {
  const raw = process.env.OUTBOUND_PROXY_URL?.trim();
  return raw || undefined;
}

/** تشخیص نوع پروکسی + پیام خطای فارسی برای مقدارهای نامعتبر */
export function classifyProxy(url: string): ProxyClass {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "invalid", reason: "آدرس پروکسی معتبر نیست (فرمت URL نیست)" };
  }
  const scheme = parsed.protocol.replace(":", "").toLowerCase();
  if (["socks", "socks4", "socks4a", "socks5", "socks5h"].includes(scheme)) {
    return { kind: "socks", scheme };
  }
  if (["http", "https"].includes(scheme)) {
    return { kind: "http", scheme };
  }
  return {
    kind: "invalid",
    reason: `پروتکل «${scheme}://» پشتیبانی نمی‌شود — فقط socks5/socks4 یا http/https`,
  };
}

/** آدرس پروکسی با ماسکِ نام‌کاربر/رمز (برای لاگ امن) */
export function describeProxy(url: string): string {
  try {
    const u = new URL(url);
    if (u.username) u.username = "***";
    if (u.password) u.password = "";
    return u.toString();
  } catch {
    return "(نامعتبر)";
  }
}

/** host:port پروکسی برای اتصال آزمایشی (پورت پیش‌فرض بر اساس پروتکل) */
function proxyEndpoint(url: string): { host: string; port: number } | null {
  try {
    const u = new URL(url);
    const scheme = u.protocol.replace(":", "").toLowerCase();
    const defaultPort =
      scheme === "https" ? 443 : scheme === "http" ? 80 : 1080; // socks
    const port = Number(u.port) || defaultPort;
    if (!u.hostname || !Number.isFinite(port) || port <= 0) return null;
    return { host: u.hostname, port };
  } catch {
    return null;
  }
}

// ── کش پروب ──
let probeCache: ProxyProbe | null = null;
/** فقط برای تست‌ها — کش Agent و پروب را ریست می‌کند */
export function resetOutboundAgentForTests(): void {
  agentPromise = null;
  loggedOnce = false;
  probeCache = null;
  probeInflight = null;
  lastFallbackWarnAt = 0;
}

/**
 * v1.0.6.7 — پروبِ در دسترس‌بودن پروکسی (اتصال TCP سبک).
 * نتیجه کش می‌شود: «روشن» ۶۰ ثانیه، «خاموش» ۲۰ ثانیه.
 * بدون پروکسی/نامعتبر → reachable=true با detail «(بدون پروکسی)»
 * تا callerها بدون شاخهٔ اضافی کار کنند.
 */
let probeInflight: Promise<ProxyProbe> | null = null;

export function probeOutboundProxy(): Promise<ProxyProbe> {
  const url = getOutboundProxyUrl();
  if (!url) {
    return Promise.resolve({
      reachable: true,
      detail: "(پروکسی تنظیم نشده — ارسال مستقیم)",
      checkedAt: Date.now(),
    });
  }
  const info = classifyProxy(url);
  if (info.kind === "invalid") {
    return Promise.resolve({
      reachable: true,
      detail: `(OUTBOUND_PROXY_URL نامعتبر: ${info.reason})`,
      checkedAt: Date.now(),
    });
  }

  const now = Date.now();
  if (probeCache) {
    const ttl = probeCache.reachable ? PROBE_UP_TTL_MS : PROBE_DOWN_TTL_MS;
    if (now - probeCache.checkedAt < ttl) return Promise.resolve(probeCache);
  }
  if (probeInflight) return probeInflight;

  probeInflight = (async (): Promise<ProxyProbe> => {
    const ep = proxyEndpoint(url);
    if (!ep) {
      const r: ProxyProbe = {
        reachable: true,
        detail: "(پورت پروکسی قابل استخراج نبود)",
        checkedAt: Date.now(),
      };
      probeCache = r;
      return r;
    }
    const result = await new Promise<ProxyProbe>((resolve) => {
      const socket = net.connect(
        { host: ep.host, port: ep.port },
        () => {
          socket.destroy();
          resolve({
            reachable: true,
            detail: `اتصال به ${ep.host}:${ep.port} برقرار شد`,
            checkedAt: Date.now(),
          });
        },
      );
      socket.setTimeout(PROBE_TIMEOUT_MS, () => {
        socket.destroy();
        resolve({
          reachable: false,
          detail: `پاسخی از ${ep.host}:${ep.port} نگرفتیم (تایم‌اوت ${PROBE_TIMEOUT_MS}ms)`,
          checkedAt: Date.now(),
        });
      });
      socket.on("error", (e: NodeJS.ErrnoException) => {
        resolve({
          reachable: false,
          detail: `${e.code ?? "خطا"} ${ep.host}:${ep.port} — ${e.message}`,
          checkedAt: Date.now(),
        });
      });
    });
    probeCache = result;
    return result;
  })().finally(() => {
    probeInflight = null;
  });

  return probeInflight;
}

/** فقط برای تست‌ها/تشخیص — وضعیت کش‌شدهٔ فعلی پروب */
export function getCachedProxyProbe(): ProxyProbe | null {
  return probeCache;
}

// ── ساخت Agent (یک بار در طول عمر پروسه، lazily) ──

let agentPromise: Promise<NodeHttpAgent | undefined> | null = null;
let loggedOnce = false;
let lastFallbackWarnAt = 0;

function warnProxyFallback(detail: string): void {
  // هشدار حداکثر هر ۳۰ ثانیه یک‌بار — لاگ شلوغ نشود
  const now = Date.now();
  if (now - lastFallbackWarnAt < 30_000) return;
  lastFallbackWarnAt = now;
  console.warn(
    `[outbound] پروکسی در دسترس نیست (${detail}) — درخواست مستقیم ارسال می‌شود. ` +
      `اگر VPN (مثلاً v2rayN) روشن شود، دوباره از تونل می‌رود؛ روی Vercel این مقدار باید خالی باشد.`,
  );
}

async function getOutboundAgent(): Promise<NodeHttpAgent | undefined> {
  const url = getOutboundProxyUrl();
  if (!url) return undefined;

  const info = classifyProxy(url);
  if (info.kind === "invalid") {
    // مقدار اشتباه نباید کل اپ را بشکند؛ فقط هشدار و مسیر مستقیم
    console.warn(
      `[outbound] OUTBOUND_PROXY_URL نامعتبر است (${info.reason}) — درخواست‌ها مستقیم می‌روند`,
    );
    return undefined;
  }

  if (!agentPromise) {
    agentPromise = (async () => {
      try {
        if (info.kind === "socks") {
          const { SocksProxyAgent } = await import("socks-proxy-agent");
          return new SocksProxyAgent(url);
        }
        const { HttpsProxyAgent } = await import("https-proxy-agent");
        return new HttpsProxyAgent(url);
      } catch (e) {
        console.error(
          `[outbound] ساخت Agent پروکسی ناموفق (${e instanceof Error ? e.message : String(e)})`,
        );
        return undefined;
      }
    })();
  }
  return agentPromise;
}

/**
 * خطاهایی که مطمئنیم «قبل از رسیدن درخواست به مقصد» رخ داده‌اند —
 * یعنی تلاش مجدد از مسیر مستقیم بی‌خطر است (ایمیل دوباره ارسال
 * نمی‌شود چون هرگز به SendGrid نرسیده بود). خطاهای مبهم
 * (ECONNRESET و…) عمداً در این لیست نیستند.
 */
const PRE_SEND_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EADDRNOTAVAIL",
  "EACCES",
  "EPERM",
]);

function isPreSendFailure(code: string | undefined, message: string): boolean {
  if (code && PRE_SEND_CODES.has(code)) return true;
  return /socks.*(closed|failed|handshake)|connection closed while establishing/i.test(
    message,
  );
}

// ── مسیر https.request (وقتی پروکسی فعال است) ──

function requestViaNode(
  url: string,
  req: OutboundRequest,
  agent: NodeHttpAgent,
  timeoutMs: number,
): Promise<OutboundResult> {
  return new Promise<OutboundResult>((resolve) => {
    let settled = false;
    const done = (r: OutboundResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    let outgoing: ClientRequest;
    try {
      outgoing = https.request(
        url,
        { method: req.method, headers: req.headers, agent, timeout: timeoutMs },
        (res) => {
          const status = res.statusCode ?? 0;
          let text = "";
          res.setEncoding("utf8");
          res.on("data", (chunk: string) => {
            text += chunk;
            if (text.length > MAX_BODY_CHARS) outgoing.destroy();
          });
          res.on("end", () =>
            done({
              kind: "http",
              ok: status >= 200 && status < 300,
              status,
              bodyText: text.slice(0, MAX_BODY_CHARS),
              via: "proxy",
            }),
          );
          res.on("error", (e) =>
            done({
              kind: "network-error",
              error: `خواندن پاسخ ناموفق: ${e.message}`,
              via: "proxy",
            }),
          );
        },
      );
    } catch (e) {
      done({
        kind: "network-error",
        error: `ساخت درخواست ناموفق: ${e instanceof Error ? e.message : String(e)}`,
        via: "proxy",
      });
      return;
    }

    outgoing.on("timeout", () =>
      outgoing.destroy(new Error(`تایم‌اوت ${timeoutMs} میلی‌ثانیه`)),
    );
    outgoing.on("error", (e: NodeJS.ErrnoException) =>
      done({
        kind: "network-error",
        error: `خطای شبکه/پروکسی: ${e.message}`,
        code: e.code,
        via: "proxy",
      }),
    );

    if (req.body) outgoing.write(req.body);
    outgoing.end();
  });
}

// ── مسیر fetch (بدون پروکسی — دقیقاً رفتار قبلی) ──

async function requestViaFetch(
  url: string,
  req: OutboundRequest,
  timeoutMs: number,
  via?: "direct",
): Promise<OutboundResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      signal: controller.signal,
      cache: "no-store",
    });
    let bodyText = "";
    try {
      bodyText = (await res.text()).slice(0, MAX_BODY_CHARS);
    } catch {
      /* بدنه خوانده نشد — مهم نیست */
    }
    return via
      ? { kind: "http", ok: res.ok, status: res.status, bodyText, via }
      : { kind: "http", ok: res.ok, status: res.status, bodyText };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    const base = aborted
      ? `پاسخی دریافت نشد (تایم‌اوت ${Math.round(timeoutMs / 1000)} ثانیه) — احتمالاً شبکه/تحریم`
      : `خطای شبکه: ${e instanceof Error ? e.message : String(e)}`;
    return via
      ? { kind: "network-error", error: base, via }
      : { kind: "network-error", error: base };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * درخواست HTTPS سرور با پشتیبانی اختیاری از پروکسی خروجی.
 *  - OUTBOUND_PROXY_URL خالی → fetch (رفتار نسخه‌های قبلی)
 *  - تنظیم‌شده و در دسترس → https.request از تونل SOCKS/HTTP
 *  - تنظیم‌شده ولی خاموش/قطع → خودکار مستقیم (v1.0.6.7) + هشدار در لاگ
 *  - req.forceDirect → همیشه مستقیم (برای تشخیص)
 * خطای شبکه هرگز throw نمی‌شود؛ همیشه OutboundResult.
 */
export async function outboundRequest(
  url: string,
  req: OutboundRequest,
): Promise<OutboundResult> {
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (req.forceDirect) {
    return requestViaFetch(url, req, timeoutMs, "direct");
  }

  const proxyUrl = getOutboundProxyUrl();
  if (!proxyUrl) {
    return requestViaFetch(url, req, timeoutMs);
  }

  const info = classifyProxy(proxyUrl);
  if (info.kind === "invalid") {
    // هشدارِ مربوطه در getOutboundAgent هم هست؛ اینجا مستقیم می‌رویم
    return requestViaFetch(url, req, timeoutMs, "direct");
  }

  // ── v1.0.6.7: اول ببینیم پروکسی زنده است (اتصال TCP سبک، کش‌شده) ──
  const probe = await probeOutboundProxy();
  if (!probe.reachable) {
    warnProxyFallback(probe.detail);
    return requestViaFetch(url, req, timeoutMs, "direct");
  }

  const agent = await getOutboundAgent();
  if (!agent) {
    // ساخت Agent شکست خورد — مستقیم
    return requestViaFetch(url, req, timeoutMs, "direct");
  }

  if (!loggedOnce) {
    loggedOnce = true;
    console.log(
      `[outbound] درخواست‌های سرور از طریق پروکسی: ${describeProxy(proxyUrl)} [${info.scheme ?? "?"}]`,
    );
  }

  const result = await requestViaNode(url, req, agent, timeoutMs);

  // ── v1.0.6.7: اگر اتصالِ پروکسی وسط راه (قبل از ارسال) قطع شد،
  // یک‌بار مستقیم تلاش کن — درخواست هرگز به مقصد نرسیده بود
  // (فقط خطاهای «قبل از ارسال»؛ خطاهای مبهم retry نمی‌شوند تا
  // هیچ‌وقت ایمیلی دوبار ارسال نشود)
  if (
    result.kind === "network-error" &&
    isPreSendFailure(result.code, result.error)
  ) {
    warnProxyFallback(result.error);
    // کش پروب را بی‌اعتبار کن تا فراخوانی بعدی دوباره پروب کند
    probeCache = null;
    return requestViaFetch(url, req, timeoutMs, "direct");
  }

  return result;
}
