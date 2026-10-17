import { describe, it, expect, vi, beforeEach } from "vitest";

// ========================================
// سرویس گیرندهٔ UptimeRobot + روت‌های پایش
// (v1.0.7.0 / English 1.0.1.13)
//
//  - کلید خالی → همهٔ توابع بی‌خطا «تنظیم نشده» برمی‌گردانند
//  - پاسخ موفق getMonitors → مدل خوانا با درصد ۱/۷/۳۰ روز
//  - پاسخ خطا (stat=fail) → پیام خوانا بدون throw
//  - خطای شبکه/تایم‌اوت → { ok:false } و سایت نمی‌شکند
//  - createMonitor بدون کلید نوشتن → راهنمای کلید Read-Write
//  - createMonitor با URL نامعتبر → خطای اعتبارسنجی قبل از fetch
//  - /api/uptime/status بدون کلید → configured:false (نه خطا)
//  - کش ۶۰ ثانیه‌ای → دومین فراخوانی بدون درخواست شبکه
//  - /api/uptime/health سالم → 200 (no-store) / قطع → 503 + hint
// ========================================

const fetchMock = vi.fn(
  async (_url: string | URL, _init?: RequestInit) =>
    ({
      ok: true,
      status: 200,
      json: async () => ({}),
    }) as unknown as Response,
);
vi.stubGlobal("fetch", fetchMock);

vi.mock("@/prisma/prisma-client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

import {
  getMonitors,
  verifyApiKey,
  createMonitor,
  clearUptimeCache,
  isUptimeRobotConfigured,
} from "@/lib/uptime-robot";
import { GET as statusGET } from "@/app/api/uptime/status/route";
import { GET as healthGET, HEAD as healthHEAD } from "@/app/api/uptime/health/route";
import { prismaMock } from "./helpers/mock-prisma";

beforeEach(() => {
  fetchMock.mockClear();
  delete process.env.UPTIME_ROBOT_API_KEY;
  delete process.env.UPTIME_ROBOT_WRITE_KEY;
  delete process.env.UPTIME_ADMIN_SECRET;
  clearUptimeCache();
});

// پاسخ استاندارد موفق getMonitors
function okMonitors() {
  return {
    stat: "ok",
    monitors: [
      {
        id: 123,
        friendly_name: "Flex English — اصلی",
        url: "https://example.ir/api/uptime/health",
        status: 2, // up
        custom_uptime_ratio: "100.000-99.800-99.500",
        last_check: 1760000000,
      },
      {
        id: 124,
        friendly_name: "بکاپ",
        url: "https://backup.example.ir/",
        status: 9, // down
        custom_uptime_ratio: "42.000-90.000-95.000",
      },
    ],
  };
}

describe("lib/uptime-robot — پیکربندی", () => {
  it("بدون کلید → isUptimeRobotConfigured=false", () => {
    expect(isUptimeRobotConfigured()).toBe(false);
  });

  it("با کلید → isUptimeRobotConfigured=true", () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-test-key";
    expect(isUptimeRobotConfigured()).toBe(true);
  });
});

describe("lib/uptime-robot — getMonitors", () => {
  it("بدون کلید → خطای راهنما، بدون هیچ درخواست شبکه", async () => {
    const res = await getMonitors();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("UPTIME_ROBOT_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("پاسخ موفق → مدل خوانا با وضعیت و درصد آپ‌تایم", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-test-key";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => okMonitors(),
    } as unknown as Response);

    const res = await getMonitors();
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.monitors).toHaveLength(2);
    const main = res.data.monitors[0];
    expect(main.state).toBe("up");
    expect(main.uptimeToday).toBe(100);
    expect(main.uptime7d).toBeCloseTo(99.8);
    expect(main.uptime30d).toBeCloseTo(99.5);
    expect(main.lastCheckAt).toBe(1760000000 * 1000);
    expect(res.data.monitors[1].state).toBe("down");
    // فراخوانی با کلید درست و مسیر درست
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.uptimerobot.com/v2/getMonitors",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("کش ۶۰ ثانیه‌ای — فراخوانی دوم بدون درخواست جدید", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-test-key";
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => okMonitors(),
    } as unknown as Response);

    await getMonitors();
    await getMonitors();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("پاسخ خطای API (stat=fail) → پیام فارسی خوانا", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-bad-key";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        stat: "fail",
        error: { type: "invalid_parameter", message: "api key is not valid" },
      }),
    } as unknown as Response);

    const res = await getMonitors();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("api key is not valid");
  });

  it("قطع شبکه/تایم‌اوت → { ok:false } بدون throw", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-test-key";
    fetchMock.mockRejectedValueOnce(new Error("fetch failed"));

    const res = await getMonitors();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("ارتباط با UptimeRobot");
  });
});

describe("lib/uptime-robot — verifyApiKey", () => {
  it("حساب را با ایمیل و شمار مانیتور برمی‌گرداند", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-test-key";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        stat: "ok",
        account: { email: "me@example.ir", monitors: 2 },
      }),
    } as unknown as Response);

    const res = await verifyApiKey();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.email).toBe("me@example.ir");
      expect(res.data.monitors).toBe(2);
    }
  });
});

describe("lib/uptime-robot — createMonitor", () => {
  it("بدون کلید نوشتن → راهنمای UPTIME_ROBOT_WRITE_KEY", async () => {
    const res = await createMonitor({
      url: "https://example.ir/api/uptime/health",
      name: "test",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("UPTIME_ROBOT_WRITE_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("URL بدون http(s) → رد قبل از تماس شبکه", async () => {
    process.env.UPTIME_ROBOT_WRITE_KEY = "u-write-key";
    const res = await createMonitor({ url: "ftp://example.ir", name: "x" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("http");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("با کلید نوشتن → newMonitor با type=HTTP", async () => {
    process.env.UPTIME_ROBOT_WRITE_KEY = "u-write-key";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        stat: "ok",
        monitor: { id: 98765 },
      }),
    } as unknown as Response);

    const res = await createMonitor({
      url: "https://example.ir/api/uptime/health",
      name: "Flex English",
      intervalSecs: 300,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.id).toBe(98765);

    const body = JSON.parse(
      (fetchMock.mock.calls[0]?.[1]?.body as string) ?? "{}",
    );
    expect(body.type).toBe(1);
    expect(body.interval).toBe(300);
  });
});

describe("GET /api/uptime/status", () => {
  it("بدون کلید → 200 با configured=false (خطا نیست)", async () => {
    const res = await statusGET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { configured?: boolean };
    expect(body.configured).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("با کلید → مانیتورها + ترجمهٔ فارسی وضعیت", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-test-key";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => okMonitors(),
    } as unknown as Response);

    const res = await statusGET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      monitors?: { stateFa?: string }[];
    };
    expect(body.monitors?.[0]?.stateFa).toBe("فعال");
    expect(body.monitors?.[1]?.stateFa).toBe("قطع");
  });

  it("خطای API خود UptimeRobot → 502 با پیام خوانا", async () => {
    process.env.UPTIME_ROBOT_API_KEY = "u-bad-key";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        stat: "fail",
        error: { message: "api key is not valid" },
      }),
    } as unknown as Response);

    const res = await statusGET();
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("api key");
  });
});

describe("GET/HEAD /api/uptime/health — نقطهٔ پایش", () => {
  it("دیتابیس سالم → 200 با ok:true (همان چیزی که UptimeRobot می‌بیند)", async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);

    const res = await healthGET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok?: boolean;
      checks?: { database?: boolean };
    };
    expect(body.ok).toBe(true);
    expect(body.checks?.database).toBe(true);
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("دیتابیس قطع → 503 با ok:false و hint (UptimeRobot اعلان می‌فرستد)", async () => {
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await healthGET();
    expect(res.status).toBe(503);
    const body = (await res.json()) as { ok?: boolean; hint?: string };
    expect(body.ok).toBe(false);
    expect(body.hint).toContain("دیتابیس");
  });

  it("HEAD هم همان کد وضعیت را می‌دهد — بدون بدنه", async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);
    const res = await healthHEAD();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
  });
});
