// ========================================
// v1.0.6.6 (English 1.0.1.9) — لایهٔ «پروکسی خروجی» سرور
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
// طراحی:
//  - خالی/نامعتبر = کاملاً بی‌اثر: همان fetch قبلی، همان رفتار،
//    همان تایم‌اوت — هیچ چیزی عوض نمی‌شود (و روی Vercel که IP
//    سالم دارد، لازم هم نیست).
//  - معتبر = درخواست با https.request خام + Agent (SocksProxyAgent
//    یا HttpsProxyAgent) — همان الگویی که openid-client هم استفاده
//    می‌کند؛ fetch برای SOCKS پروکسی Agent نمی‌پذیرد.
//  - همهٔ خروجی‌ها از نوع OutboundResult؛ خطای شبکه هرگز throw
//    نمی‌شود.
// ========================================

import https from "node:https";
import type { Agent as NodeHttpAgent, ClientRequest } from "node:http";

const DEFAULT_TIMEOUT_MS = 10_000;
/** سقف اندازهٔ بدنهٔ پاسخ که می‌خوانیم (جلوگیری از حافظهٔ بی‌پایان) */
const MAX_BODY_CHARS = 200_000;

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
};

export type OutboundResult =
  | { kind: "http"; ok: boolean; status: number; bodyText: string }
  | { kind: "network-error"; error: string };

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

// ── ساخت Agent (یک بار در طول عمر پروسه، lazily) ──

let agentPromise: Promise<NodeHttpAgent | undefined> | null = null;
let loggedOnce = false;

/** فقط برای تست‌ها — کش Agent را ریست می‌کند */
export function resetOutboundAgentForTests(): void {
  agentPromise = null;
  loggedOnce = false;
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
            }),
          );
          res.on("error", (e) =>
            done({ kind: "network-error", error: `خواندن پاسخ ناموفق: ${e.message}` }),
          );
        },
      );
    } catch (e) {
      done({
        kind: "network-error",
        error: `ساخت درخواست ناموفق: ${e instanceof Error ? e.message : String(e)}`,
      });
      return;
    }

    outgoing.on("timeout", () =>
      outgoing.destroy(new Error(`تایم‌اوت ${timeoutMs} میلی‌ثانیه`)),
    );
    outgoing.on("error", (e) =>
      done({
        kind: "network-error",
        error: `خطای شبکه/پروکسی: ${e.message}`,
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
): Promise<OutboundResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      signal: controller.signal,
    });
    let bodyText = "";
    try {
      bodyText = (await res.text()).slice(0, MAX_BODY_CHARS);
    } catch {
      /* بدنه خوانده نشد — مهم نیست */
    }
    return { kind: "http", ok: res.ok, status: res.status, bodyText };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      kind: "network-error",
      error: aborted
        ? `پاسخی دریافت نشد (تایم‌اوت ${Math.round(timeoutMs / 1000)} ثانیه) — احتمالاً شبکه/تحریم`
        : `خطای شبکه: ${e instanceof Error ? e.message : String(e)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * درخواست HTTPS سرور با پشتیبانی اختیاری از پروکسی خروجی.
 *  - OUTBOUND_PROXY_URL خالی → fetch (رفتار نسخه‌های قبلی)
 *  - تنظیم‌شده → https.request از تونل SOCKS/HTTP
 * خطای شبکه هرگز throw نمی‌شود؛ همیشه OutboundResult.
 */
export async function outboundRequest(
  url: string,
  req: OutboundRequest,
): Promise<OutboundResult> {
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const agent = await getOutboundAgent();

  if (agent) {
    const proxyUrl = getOutboundProxyUrl();
    if (proxyUrl && !loggedOnce) {
      loggedOnce = true;
      const info = classifyProxy(proxyUrl);
      console.log(
        `[outbound] درخواست‌های سرور از طریق پروکسی: ${describeProxy(proxyUrl)} [${info.scheme ?? "?"}]`,
      );
    }
    return requestViaNode(url, req, agent, timeoutMs);
  }

  return requestViaFetch(url, req, timeoutMs);
}
