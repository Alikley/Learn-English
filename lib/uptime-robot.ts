// ========================================
// سرویس گیرندهٔ UptimeRobot (v1.0.7.0 / English 1.0.1.13)
//
// 🎯 هدف: پایش بیرونی سایت با UptimeRobot —
//    1) روت عمومی /api/uptime/health را UptimeRobot هر ۵ دقیقه
//       صدا می‌زند و «سلامت سرور + دیتابیس» را چک می‌کند؛
//    2) این کتابخانه وضعیت مانیتورها را از API خود UptimeRobot
//       می‌خواند تا سایت بتواند وضعیت سرویس را نشان دهد؛
//    3) ساخت مانیتور جدید از داخل پروژه (بدون ورود به داشبورد).
//
// 🔌 متغیرهای محیطی (.env):
//    UPTIME_ROBOT_API_KEY  — کلید Read-Only برای خواندن وضعیت
//    UPTIME_ROBOT_WRITE_KEY — کلید Read-Write برای «ساخت» مانیتور
//    (هر دو اختیاری؛ خالی = این ماژول غیرفعال و بی‌خطا است)
//
// 📖 راهنمای گرفتن کلید: docs/UPTIME-ROBOT.md
//
// ⚠️ فقط سمت سرور — هرگز در کامپوننت کلاینت import نشود.
//    هیچ تابعی throw نمی‌کند؛ خطا به شکل { ok: false, … }
//    برمی‌گردد تا مسیر اصلی سایت هرگز نشکند.
// ========================================

const API_BASE = "https://api.uptimerobot.com/v2";

/** کلید خواندن (Read-Only) — برای getMonitors/getAccountDetails */
const READ_KEY = () => process.env.UPTIME_ROBOT_API_KEY?.trim() || "";
/** کلید نوشتن (Read-Write / Main) — فقط برای newMonitor */
const WRITE_KEY = () => process.env.UPTIME_ROBOT_WRITE_KEY?.trim() || "";

/** آیا خواندن وضعیت پیکربندی شده؟ */
export function isUptimeRobotConfigured(): boolean {
  return READ_KEY().length > 0;
}

// ── انواع داده (زیرمجموعهٔ سودمند پاسخ API v2) ──────────────

/** وضعیت یک مانیتور — عدد خام API به متن خوانا تبدیل می‌شود */
export type MonitorState =
  | "paused"
  | "not-checked-yet"
  | "up"
  | "seems-down"
  | "down"
  | "unknown";

export type UptimeMonitor = {
  id: number;
  name: string;
  url: string;
  state: MonitorState;
  /** درصد آپ‌تایم: امروز / ۷ روز / ۳۰ روز */
  uptimeToday: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  /** آخرین زمان بررسی به شکل epoch میلی‌ثانیه */
  lastCheckAt: number | null;
};

export type UptimeRobotResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ── حافظهٔ کوچک برای جلوگیری از فشار به API ────────────────
// UptimeRobot وضعیت را حداکثر هر ۵ دقیقه به‌روز می‌کند؛ کش ۶۰
// ثانیه‌ای یعنی هر بار حداکثر یک درخواست واقعی — حتی اگر ۱۰۰۰
// کاربر همزمان صفحهٔ وضعیت را باز کنند.

type CacheEntry = { at: number; payload: unknown };
const CACHE_TTL_MS = 60_000;
let cache: CacheEntry | null = null;

function cacheGet<T>(): T | null {
  if (!cache) return null;
  if (Date.now() - cache.at > CACHE_TTL_MS) {
    cache = null;
    return null;
  }
  return cache.payload as T;
}

function cacheSet(payload: unknown) {
  cache = { at: Date.now(), payload };
}

// ── لایهٔ ارتباط با API ─────────────────────────────────────

type ApiEnvelope<T> = { stat: "ok"; page?: number; [k: string]: unknown } & T;

/**
 * فراخوانی عمومی UptimeRobot API v2.
 * - روش: POST با بدنهٔ JSON (API هر دو را می‌پذیرد)
 * - تایم‌اوت ۸ ثانیه — سایت نباید برای سرویس جانبی معطل بماند
 * - هرگز throw نمی‌کند؛ خطا با { ok:false, error } برمی‌گردد
 */
async function callApi<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<UptimeRobotResult<ApiEnvelope<T>>> {
  const body = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined),
  );

  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });

    const json = (await res.json()) as Record<string, unknown>;

    if (json.stat !== "ok") {
      // ساختار خطای رسمی: { stat:"fail", error:{ ... } }
      const e = json.error as { message?: string; type?: string } | undefined;
      return {
        ok: false,
        error: e?.message || `UptimeRobot خطای «${res.status}» برگرداند`,
      };
    }

    return { ok: true, data: json as ApiEnvelope<T> };
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "خطای ناشناخته";
    return { ok: false, error: `ارتباط با UptimeRobot برقرار نشد: ${msg}` };
  }
}

/** ترجمهٔ کد عددی وضعیت به متن (مطابق مستندات API v2) */
function parseState(code: unknown): MonitorState {
  switch (code) {
    case 0:
      return "paused";
    case 1:
      return "not-checked-yet";
    case 2:
      return "up";
    case 8:
      return "seems-down";
    case 9:
      return "down";
    default:
      return "unknown";
  }
}

// ── توابع عمومی ─────────────────────────────────────────────

type RawMonitor = {
  id: number;
  friendly_name: string;
  url?: string;
  status?: number;
  custom_uptime_ratio?: string;
  all_time_uptime_ratio?: number;
  last_check?: number;
};

/**
 * فهرست مانیتورها با درصد آپ‌تایم ۲۴ساعت/۷روز/۳۰روز.
 * نتیجهٔ موفق ۶۰ ثانیه کش می‌شود.
 * مثال خروجی: { ok:true, data:{ monitors:[ … ], fetchedAt } }
 */
export async function getMonitors(): Promise<
  UptimeRobotResult<{ monitors: UptimeMonitor[]; fetchedAt: number }>
> {
  const key = READ_KEY();
  if (!key) {
    return {
      ok: false,
      error: "UPTIME_ROBOT_API_KEY در .env تنظیم نشده است",
    };
  }

  const cached = cacheGet<{ monitors: UptimeMonitor[]; fetchedAt: number }>();
  if (cached) return { ok: true, data: cached };

  const res = await callApi<{ monitors: RawMonitor[] }>("getMonitors", {
    api_key: key,
    format: "json",
    // نسبت‌های دلخواه: ۲۴ ساعت، ۷ روز، ۳۰ روز
    custom_uptime_ratios: "1-7-30",
    logs: 0,
  });

  if (!res.ok) return res;

  const monitors: UptimeMonitor[] = (res.data.monitors || []).map((m) => {
    // "100.000-99.800-99.500" → سه عدد جدا
    const parts = (m.custom_uptime_ratio || "").split("-");
    const pct = (s: string | undefined) =>
      s === undefined || s === "" ? null : Number(s);
    return {
      id: m.id,
      name: m.friendly_name,
      url: m.url ?? "",
      state: parseState(m.status),
      uptimeToday: pct(parts[0]),
      uptime7d: pct(parts[1]),
      uptime30d: pct(parts[2]),
      // API ثانیه می‌دهد؛ ما میلی‌ثانیه نگه می‌داریم (قرارداد Date)
      lastCheckAt: m.last_check ? m.last_check * 1000 : null,
    };
  });

  const payload = { monitors, fetchedAt: Date.now() };
  cacheSet(payload);
  return { ok: true, data: payload };
}

/**
 * صحت‌سنجی کلید — برای تست سریع «کلیدم کار می‌کند؟»
 * GET نداریم؛ getAccountDetails سبک‌ترین فراخوانی است.
 */
export async function verifyApiKey(): Promise<
  UptimeRobotResult<{ email: string; monitors: number }>
> {
  const key = READ_KEY();
  if (!key) {
    return {
      ok: false,
      error: "UPTIME_ROBOT_API_KEY در .env تنظیم نشده است",
    };
  }

  const res = await callApi<{
    account: { email: string; monitors: number };
  }>("getAccountDetails", {
    api_key: key,
    format: "json",
  });

  if (!res.ok) return res;
  return {
    ok: true,
    data: {
      email: res.data.account?.email ?? "",
      monitors: res.data.account?.monitors ?? 0,
    },
  };
}

type NewMonitorResult = { monitor: { id: number } };

/**
 * ساخت مانیتور HTTP جدید — برای این کار «کلید Read-Write» لازم
 * است (کلید Read-Only خطای «api key is read-only» می‌دهد).
 *
 * @param url   آدرس کامل مثل https://example.ir/api/uptime/health
 * @param name  نام دلخواه در داشبورد مثل «Flex English — اصلی»
 * @param intervalSecs  بازهٔ بررسی (پلن رایگان: حداقل ۳۰۰ ثانیه)
 */
export async function createMonitor(params: {
  url: string;
  name: string;
  intervalSecs?: number;
}): Promise<UptimeRobotResult<{ id: number }>> {
  const key = WRITE_KEY();
  if (!key) {
    return {
      ok: false,
      error:
        "UPTIME_ROBOT_WRITE_KEY (کلید Read-Write) در .env تنظیم نشده است — ساخت مانیتور ممکن نیست",
    };
  }

  const url = params.url.trim();
  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, error: "آدرس مانیتور باید با http:// یا https:// شروع شود" };
  }

  const res = await callApi<NewMonitorResult>("newMonitor", {
    api_key: key,
    format: "json",
    friendly_name: params.name.trim() || url,
    url,
    type: 1, // 1 = HTTP(s)
    interval: params.intervalSecs ?? 300,
  });

  if (!res.ok) return res;
  return { ok: true, data: { id: res.data.monitor.id } };
}

/** پاک‌کردن دستی کش (برای تست یا بعد از تغییر تنظیمات) */
export function clearUptimeCache() {
  cache = null;
}
