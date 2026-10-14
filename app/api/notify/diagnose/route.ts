import { NextRequest, NextResponse } from "next/server";
import { reportError } from "@/lib/report-error";
import {
  outboundRequest,
  probeOutboundProxy,
  getOutboundProxyUrl,
  classifyProxy,
  describeProxy,
  type OutboundResult,
} from "@/lib/outbound-proxy";
import { isSendgridConfigured } from "@/lib/sendgrid";
import { isOneSignalConfigured, onesignalAuthHeader } from "@/lib/onesignal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// GET /api/notify/diagnose (v1.0.6.7 / English 1.0.1.10)
//
// «تشخیص خودکار» مشکلات ایمیل (SendGrid) و پوش (OneSignal):
//  - هیچ ایمیلی و هیچ پوشی ارسال نمی‌شود (فقط GET)
//  - هیچ مقدار کلیدی در پاسخ لو نمی‌رود (فقط وضعیت)
//
// v1.0.6.7 — سه اصلاح مهم بر پایهٔ گزارش واقعی ۱.۰.1.9:
//  1) «مستقیم» این‌بار واقعاً مستقیم است (forceDirect) — قبلاً
//     چکِ direct هم از پروکسی می‌گذشت و نتیجه گمراه‌کننده بود.
//  2) وضعیت پروکسی با «پروبِ TCP» جداگانه اعلام می‌شود — اگر
//     OUTBOUND_PROXY_URL تنظیم شده ولی VPN خاموش باشد (خطای
//     ECONNREFUSED که در لاگ شما دیدید)، همین روت علت را دقیق
//     می‌گوید و می‌گوید ایمیل‌ها فعلاً مستقیم می‌روند.
//  3) همهٔ چک‌ها موازی اجرا می‌شوند (تأخیر ~۱۱ ثانیه‌ای حذف شد)
//     و چکِ فایل سرویس‌ورکر با fetch سادهٔ خودِ سایت انجام
//     می‌شود (قبلاً بی‌دلیل از پروکسی می‌گذشت).
//
// بررسی‌ها:
//  SendGrid:
//   1) کلید → GET api.sendgrid.com/v3/scopes (مستقیمِ واقعی + از
//      مسیر پیش‌فرض = پروکسی اگر زنده باشد)
//      200 = سالم · 401 = کلید غلط · 451 = بلاک تحریمی IP مبدا
//   2) فرستنده → GET /v3/verified_senders (باید verified=true)
//  OneSignal:
//   3) GET api.onesignal.com/apps/{appId} → 401 = کلید غلط ·
//      200 ولی chrome_web_origin=null = علتِ دقیق خطای
//      «App not configured for web push» در مرورگر!
//   4) فایل public/OneSignalSDKWorker.js در ریشهٔ سایت هست؟
//
// امنیت: فقط وضعیت (سالم/غلط/بلاک) برمی‌گردد + محدودیت
// حافظه‌ای: هر IP حداکثر ۶ بار در ۵ دقیقه.
// ========================================

type Verdict = { level: "ok" | "warn" | "error" | "info"; fa: string; en: string };

const RATE_WINDOW_MS = 5 * 60_000;
const RATE_MAX = 6;
const rateHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    rateHits.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateHits.set(ip, arr);
  return false;
}

function httpBrief(r: OutboundResult): string {
  return r.kind === "http"
    ? `HTTP ${r.status}`
    : `شبکه: ${r.error.slice(0, 140)}`;
}

/** تایم‌اوت هر چک — کوتاه؛ همهٔ چک‌ها موازی اجرا می‌شوند */
const CHECK_TIMEOUT_MS = 5_000;
const WORKER_TIMEOUT_MS = 4_000;

type KeyCheck = {
  direct: { tested: boolean; brief: string; status?: number };
  viaProxy: { tested: boolean; brief: string; status?: number };
};

async function oneSendgridScopesCall(
  headers: Record<string, string>,
  forceDirect: boolean,
): Promise<{ brief: string; status?: number }> {
  const r = await outboundRequest("https://api.sendgrid.com/v3/scopes", {
    method: "GET",
    headers,
    timeoutMs: CHECK_TIMEOUT_MS,
    forceDirect,
  });
  return {
    brief: httpBrief(r),
    status: r.kind === "http" ? r.status : undefined,
  };
}

async function checkSendgridKey(): Promise<KeyCheck> {
  const key = process.env.SENDGRID_API_KEY!;
  const headers = { Authorization: `Bearer ${key}` };
  const out: KeyCheck = {
    direct: { tested: false, brief: "" },
    viaProxy: { tested: false, brief: "" },
  };

  // v1.0.6.7 — «مستقیم واقعی» (forceDirect) و «مسیر پیش‌فرض»
  // (پروکسی اگر تنظیم و زنده باشد) موازی اجرا می‌شوند
  const proxyConfigured = Boolean(getOutboundProxyUrl());
  const jobs: Array<Promise<void>> = [
    oneSendgridScopesCall(headers, true).then((r) => {
      out.direct = { tested: true, ...r };
    }),
  ];
  if (proxyConfigured) {
    jobs.push(
      oneSendgridScopesCall(headers, false).then((r) => {
        out.viaProxy = { tested: true, ...r };
      }),
    );
  }
  await Promise.all(jobs);
  return out;
}

async function checkSendgridSender(): Promise<{
  tested: boolean;
  verified: boolean;
  fromEmail: string;
  brief: string;
}> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "";
  const key = process.env.SENDGRID_API_KEY!;
  const res = await outboundRequest(
    "https://api.sendgrid.com/v3/verified_senders",
    { method: "GET", headers: { Authorization: `Bearer ${key}` }, timeoutMs: CHECK_TIMEOUT_MS },
  );
  if (res.kind !== "http") {
    return { tested: true, verified: false, fromEmail, brief: httpBrief(res) };
  }
  let verified = false;
  try {
    const body = JSON.parse(res.bodyText || "{}") as {
      results?: Array<{ from_email?: string; verified?: boolean }>;
    };
    verified = Boolean(
      (body.results ?? []).some(
        (r) => r.from_email === fromEmail && r.verified,
      ),
    );
  } catch {
    /* بدنه JSON نبود */
  }
  return { tested: true, verified, fromEmail, brief: `HTTP ${res.status}` };
}

type OneSignalCheck = {
  tested: boolean;
  status?: number;
  brief: string;
  webPushOrigin?: string | null;
};

async function checkOneSignalApp(): Promise<OneSignalCheck> {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
  const restKey = process.env.ONESIGNAL_REST_API_KEY!;
  const res = await outboundRequest(
    `https://api.onesignal.com/apps/${appId}`,
    { method: "GET", headers: { Authorization: onesignalAuthHeader(restKey) }, timeoutMs: CHECK_TIMEOUT_MS },
  );
  if (res.kind !== "http") {
    return { tested: true, brief: httpBrief(res) };
  }
  let origin: string | null | undefined;
  try {
    const body = JSON.parse(res.bodyText || "{}") as {
      chrome_web_origin?: string | null;
    };
    origin = body.chrome_web_origin ?? null;
  } catch {
    /* بدنه JSON نبود */
  }
  return { tested: true, status: res.status, brief: `HTTP ${res.status}`, webPushOrigin: origin };
}

/**
 * فایل سرویس‌ورکر OneSignal باید در ریشهٔ سایت باشد (مستندات رسمی).
 * v1.0.6.7 — این فایل از «خودِ سایت» خوانده می‌شود؛ fetch ساده
 * (بدون پروکسی خروجی — سایت خودمان است، نه سرویس خارجی).
 */
async function checkWorkerFile(origin: string): Promise<{ ok: boolean; brief: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);
  try {
    const res = await fetch(`${origin}/OneSignalSDKWorker.js`, {
      signal: controller.signal,
      cache: "no-store",
    });
    let hasImportScripts = false;
    if (res.ok) {
      const text = await res.text().catch(() => "");
      hasImportScripts = /importScripts/i.test(text);
    }
    return {
      ok: res.ok && hasImportScripts,
      brief: hasImportScripts
        ? `HTTP ${res.status}`
        : `HTTP ${res.status} (بدون importScripts!)`,
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      brief: aborted
        ? `تایم‌اوت ${WORKER_TIMEOUT_MS / 1000} ثانیه`
        : `شبکه: ${e instanceof Error ? e.message : String(e)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function handle(req: NextRequest) {
  try {
    const startedAt = Date.now();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.nextUrl.origin;
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "درخواست‌های تشخیص زیاد است — چند دقیقه بعد دوباره امتحان کنید" },
        { status: 429 },
      );
    }

    const siteOrigin = req.nextUrl.origin;
    const proxyUrl = getOutboundProxyUrl();
    const proxyClass = proxyUrl ? classifyProxy(proxyUrl) : null;

    // ── همهٔ چک‌ها موازی (v1.0.6.7 — تأخیر ~۱۱ ثانیه‌ای حذف شد) ──
    const sendgridOn = Boolean(process.env.SENDGRID_API_KEY);
    const onesignalOn = isOneSignalConfigured();

    const [
      probe,
      sendgridKey,
      sendgridSender,
      onesignalApp,
      worker,
    ] = await Promise.all([
      proxyUrl ? probeOutboundProxy() : Promise.resolve(null),
      sendgridOn
        ? checkSendgridKey()
        : Promise.resolve<KeyCheck>({ direct: { tested: false, brief: "" }, viaProxy: { tested: false, brief: "" } }),
      sendgridOn
        ? checkSendgridSender()
        : Promise.resolve({
            tested: false,
            verified: false,
            fromEmail: process.env.SENDGRID_FROM_EMAIL ?? "",
            brief: "",
          }),
      onesignalOn
        ? checkOneSignalApp()
        : Promise.resolve<OneSignalCheck>({ tested: false, brief: "" }),
      onesignalOn
        ? checkWorkerFile(siteOrigin)
        : Promise.resolve<{ ok: boolean; brief: string } | null>(null),
    ]);

    const proxy = {
      configured: Boolean(proxyUrl),
      describe: proxyUrl ? describeProxy(proxyUrl) : "",
      kind: proxyClass?.kind ?? null,
      scheme: proxyClass?.scheme ?? null,
      reason: proxyClass?.reason ?? null,
      // v1.0.6.7 — نتیجهٔ پروبِ در دسترس‌بودن پروکسی
      probe: probe
        ? { reachable: probe.reachable, detail: probe.detail }
        : null,
    };

    // ── جمع‌بندی دوزبانه ──
    const verdicts: Verdict[] = [];

    // پروکسی
    if (proxy.configured && proxy.kind === "invalid") {
      verdicts.push({
        level: "error",
        fa: `OUTBOUND_PROXY_URL نامعتبر است (${proxy.reason}) — درخواست‌ها مستقیم می‌روند`,
        en: `OUTBOUND_PROXY_URL is invalid (${proxy.reason}) — requests go direct`,
      });
    } else if (proxy.configured) {
      if (proxy.probe && !proxy.probe.reachable) {
        verdicts.push({
          level: "error",
          fa: `پروکسی تنظیم شده (${proxy.describe}) ولی پاسخ نمی‌دهد: ${proxy.probe.detail} — یعنی VPN (مثلاً v2rayN) روشن نیست و درخواست‌ها فعلاً «مستقیم» ارسال می‌شوند. راه‌حل: VPN را باز کنید و پورت SOCKS را چک کنید (پیش‌فرض v2rayN: 10808) یا مقدار OUTBOUND_PROXY_URL را در .env خالی کنید. روی Vercel این مقدار باید خالی باشد.`,
          en: `Proxy is configured (${proxy.describe}) but not reachable: ${proxy.probe.detail} — the VPN is off, so requests currently go direct. Fix: open your VPN (v2rayN default SOCKS port: 10808) or clear OUTBOUND_PROXY_URL. On Vercel this must be empty.`,
        });
      } else {
        verdicts.push({
          level: "info",
          fa: `پروکسی خروجی فعال و در دسترس است: ${proxy.describe} [${proxy.scheme}]`,
          en: `Outbound proxy active and reachable: ${proxy.describe} [${proxy.scheme}]`,
        });
      }
    }

    // SendGrid
    if (!isSendgridConfigured()) {
      verdicts.push({
        level: "info",
        fa: "SendGrid تنظیم نشده (حالت توسعه) — لینک بازیابی فقط در کنسول سرور چاپ می‌شود",
        en: "SendGrid not configured (dev mode) — reset link is only logged on the server",
      });
    } else {
      const st = sendgridKey.direct.status;
      if (st === 200) {
        verdicts.push({
          level: "ok",
          fa: proxy.configured
            ? "کلید SendGrid از IP این سرور پذیرفته شد (سالم) — می‌توانید OUTBOUND_PROXY_URL را خالی بگذارید"
            : "کلید SendGrid از این IP پذیرفته شد (سالم)",
          en: "SendGrid key accepted from this IP (valid)",
        });
      } else if (st === 401 || st === 403) {
        verdicts.push({
          level: "error",
          fa: `کلید SendGrid پذیرفته نشد (${sendgridKey.direct.brief}) — کلید را در داشبورد SendGrid بسازید/بررسی کنید`,
          en: `SendGrid key rejected (${sendgridKey.direct.brief}) — check the key in the SendGrid dashboard`,
        });
      } else if (st === 451) {
        if (sendgridKey.viaProxy.tested && sendgridKey.viaProxy.status === 200) {
          verdicts.push({
            level: "ok",
            fa: "IP مبدا بلاک تحریمی است (451) ولی کلید از طریق پروکسی کار می‌کند ✔ — ایمیل‌ها با OUTBOUND_PROXY_URL ارسال می‌شوند",
            en: "Origin IP is sanctions-blocked (451) but the key works via proxy ✔ — emails will send through OUTBOUND_PROXY_URL",
          });
        } else {
          const proxyPart = proxy.configured
            ? proxy.probe && !proxy.probe.reachable
              ? " — پروکسی هم تنظیم شده ولی خاموش است (VPN را روشن کنید و دوباره این تشخیص را اجرا کنید)"
              : sendgridKey.viaProxy.tested
                ? ` — تست از پروکسی هم ناموفق بود (${sendgridKey.viaProxy.brief}؛ VPN را در حالت TUN/سیستمی بررسی کنید)`
                : ""
            : "";
          verdicts.push({
            level: "error",
            fa: `IP مبدا بلاک تحریمی است (451 — کلید و فرستنده سالم‌اند). راه‌حل: VPN (v2rayN) را روشن کنید و در .env مقدار OUTBOUND_PROXY_URL را روی پروکسی آن بگذارید (مثلاً socks5://127.0.0.1:10808) و سرور را ری‌استارت کنید${proxyPart}`,
            en: `Origin IP is sanctions-blocked (451 — key and sender are fine). Fix: turn on your VPN, set OUTBOUND_PROXY_URL in .env (e.g. socks5://127.0.0.1:10808) and restart the server`,
          });
        }
      } else if (!st) {
        verdicts.push({
          level: "error",
          fa: `اتصال به SendGrid برقرار نشد (${sendgridKey.direct.brief})`,
          en: `Could not reach SendGrid (${sendgridKey.direct.brief})`,
        });
      }

      if (sendgridSender.tested && !sendgridSender.verified) {
        verdicts.push({
          level: "warn",
          fa: `فرستندهٔ «${sendgridSender.fromEmail}» در SendGrid تأیید نشده است — Settings → Sender Authentication → Verify a Single Sender`,
          en: `Sender "${sendgridSender.fromEmail}" is not verified in SendGrid — Settings → Sender Authentication → Verify a Single Sender`,
        });
      } else if (sendgridSender.verified) {
        verdicts.push({
          level: "ok",
          fa: "فرستندهٔ ایمیل در SendGrid تأیید شده است",
          en: "Email sender is verified in SendGrid",
        });
      }
    }

    // OneSignal
    if (!isOneSignalConfigured()) {
      verdicts.push({
        level: "info",
        fa: "OneSignal تنظیم نشده — یادآور پوش غیرفعال است (اختیاری)",
        en: "OneSignal not configured — push reminder is off (optional)",
      });
    } else {
      if (onesignalApp.status === 401) {
        verdicts.push({
          level: "error",
          fa: `کلید REST OneSignal پذیرفته نشد (${onesignalApp.brief}) — Settings → Keys & IDs`,
          en: `OneSignal REST key rejected (${onesignalApp.brief}) — Settings → Keys & IDs`,
        });
      } else if (onesignalApp.status === 200) {
        if (!onesignalApp.webPushOrigin) {
          verdicts.push({
            level: "error",
            fa: "وب‌پوش در داشبورد OneSignal تنظیم نشده — علتِ دقیق خطای «App not configured for web push» همین است. مسیر: داشبورد OneSignal → Settings → Push & In-App (Channels) → Web → Typical Site → آدرس سایت (مثلاً https://learn-english-wine.vercel.app) → Save",
            en: "Web push is not configured in the OneSignal dashboard — this is the exact cause of “App not configured for web push”. Path: OneSignal dashboard → Settings → Push & In-App (Channels) → Web → Typical Site → your site URL → Save",
          });
        } else {
          verdicts.push({
            level: "ok",
            fa: `وب‌پوش برای «${onesignalApp.webPushOrigin}» فعال است`,
            en: `Web push is active for "${onesignalApp.webPushOrigin}"`,
          });
          if (onesignalApp.webPushOrigin !== siteOrigin) {
            verdicts.push({
              level: "warn",
              fa: `دامنهٔ فعلی (${siteOrigin}) با دامنهٔ ثبت‌شده (${onesignalApp.webPushOrigin}) فرق دارد — OneSignal فقط روی همان دامنه کار می‌کند (یک اپ = یک دامنه؛ برای لوکال، اپ توسعهٔ جدا بسازید)`,
              en: `Current origin (${siteOrigin}) differs from the configured one (${onesignalApp.webPushOrigin}) — OneSignal only works on the configured origin (one app = one origin; create a separate dev app for localhost)`,
            });
          }
        }
      } else if (!onesignalApp.status) {
        verdicts.push({
          level: "error",
          fa: `اتصال به api.onesignal.com برقرار نشد (${onesignalApp.brief})`,
          en: `Could not reach api.onesignal.com (${onesignalApp.brief})`,
        });
      }

      if (worker && !worker.ok) {
        verdicts.push({
          level: "warn",
          fa: `فایل /OneSignalSDKWorker.js در ریشهٔ سایت پاسخ نداد (${worker.brief}) — این فایل در پروژه هست (public/)؛ اگر روی سرور دیگری هستید کپی کنید`,
          en: `/OneSignalSDKWorker.js at the site root did not respond (${worker.brief}) — the file exists in the project (public/); copy it if hosting elsewhere`,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      ranAt: new Date().toISOString(),
      elapsedMs: Date.now() - startedAt,
      siteOrigin,
      proxy,
      sendgrid: {
        configured: isSendgridConfigured(),
        keyCheck: sendgridKey,
        senderCheck: sendgridSender,
      },
      onesignal: {
        configured: isOneSignalConfigured(),
        appCheck: onesignalApp,
        workerCheck: worker,
      },
      verdicts,
    });
  } catch (e) {
    reportError(e, { route: "/api/notify/diagnose" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}
