import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// لایهٔ «پروکسی خروجی» + روت تشخیص خودکار
// (v1.0.6.7 / English 1.0.1.10)
//
//  - classifyProxy: socks5/socks4/http/https/نامعتبر
//  - describeProxy: ماسک کردن user:pass
//  - outboundRequest بدون OUTBOUND_PROXY_URL → fetch (رفتار قبلی)
//  - v1.0.6.7: پروکسی «خاموش» (ECONNREFUSED) → fallback خودکار به
//    مستقیم (via=direct) — دیگر ایمیل به‌خاطر VPN خاموش نمی‌شکند
//  - forceDirect → همیشه مستقیم (حتی با پروکسی تنظیم‌شده)
//  - GET /api/notify/diagnose بدون هیچ کلیدی → فقط verdictهای
//    «تنظیم نشده» بدون هیچ فراخوانی شبکه
//  - GET /api/notify/diagnose با کلید + پروکسی خاموش + 451 →
//    پروبِ پروکسی در پاسخ + verdict دقیق «VPN روشن نیست»
// ========================================

vi.mock("@/prisma/prisma-client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const fetchMock = vi.fn(
  async (_url: string, _init?: RequestInit) =>
    ({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "ok-body",
    }) as unknown as Response,
);
vi.stubGlobal("fetch", fetchMock);

import {
  classifyProxy,
  describeProxy,
  getOutboundProxyUrl,
  outboundRequest,
  probeOutboundProxy,
  resetOutboundAgentForTests,
} from "@/lib/outbound-proxy";
import { GET as diagnoseGET } from "@/app/api/notify/diagnose/route";
import { NextRequest } from "next/server";

const DIAGNOSE_URL = "http://localhost:3000/api/notify/diagnose";

beforeEach(() => {
  fetchMock.mockClear();
  delete process.env.OUTBOUND_PROXY_URL;
  resetOutboundAgentForTests();
  delete process.env.SENDGRID_API_KEY;
  delete process.env.SENDGRID_FROM_EMAIL;
  delete process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  delete process.env.ONESIGNAL_REST_API_KEY;
});

afterEach(() => {
  delete process.env.OUTBOUND_PROXY_URL;
  resetOutboundAgentForTests();
});

describe("lib/outbound-proxy — classifyProxy", () => {
  it("socks5 و socks5h و socks4 → kind=socks", () => {
    expect(classifyProxy("socks5://127.0.0.1:10808")).toEqual({
      kind: "socks",
      scheme: "socks5",
    });
    expect(classifyProxy("socks5h://localhost:9050").kind).toBe("socks");
    expect(classifyProxy("socks4://1.2.3.4:1080").kind).toBe("socks");
  });

  it("http و https → kind=http", () => {
    expect(classifyProxy("http://127.0.0.1:10809")).toEqual({
      kind: "http",
      scheme: "http",
    });
    expect(classifyProxy("https://proxy.example.com:443").kind).toBe("http");
  });

  it("URL خراب → invalid با reason", () => {
    const r = classifyProxy("نه-یک-آدرس");
    expect(r.kind).toBe("invalid");
    expect(r.reason).toBeTruthy();
  });

  it("پروتکل ناشناخته (ftp) → invalid", () => {
    const r = classifyProxy("ftp://1.2.3.4:21");
    expect(r.kind).toBe("invalid");
    expect(r.reason).toContain("ftp");
  });
});

describe("lib/outbound-proxy — describeProxy", () => {
  it("نام‌کاربر/رمز ماسک می‌شود", () => {
    const masked = describeProxy("socks5://ali:secret@127.0.0.1:10808");
    expect(masked).not.toContain("secret");
    expect(masked).not.toContain("ali");
    expect(masked).toContain("127.0.0.1:10808");
  });

  it("بدون credential → همان آدرس", () => {
    expect(describeProxy("http://127.0.0.1:7890")).toContain(
      "http://127.0.0.1:7890",
    );
  });
});

describe("lib/outbound-proxy — outboundRequest (بدون پروکسی = fetch قبلی)", () => {
  it("OUTBOUND_PROXY_URL خالی → همان fetch با url/headers/body", async () => {
    expect(getOutboundProxyUrl()).toBeUndefined();
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "POST",
      headers: { Authorization: "Bearer x", "Content-Type": "application/json" },
      body: '{"a":1}',
    });
    expect(r).toEqual({ kind: "http", ok: true, status: 200, bodyText: "ok-body" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.example.com/v1");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer x");
    expect(init.body).toBe('{"a":1}');
  });

  it("خطای شبکه fetch → network-error بدون throw", async () => {
    fetchMock.mockImplementationOnce(async () => {
      throw new Error("boom-network");
    });
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "GET",
      headers: {},
    });
    expect(r.kind).toBe("network-error");
    if (r.kind === "network-error") expect(r.error).toContain("boom-network");
  });

  it("پاسخ خطای HTTP → ok=false با status", async () => {
    fetchMock.mockImplementationOnce(
      async () =>
        ({ ok: false, status: 451, text: async () => "nope" }) as unknown as Response,
    );
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "GET",
      headers: {},
    });
    expect(r).toMatchObject({ kind: "http", ok: false, status: 451, bodyText: "nope" });
  });
});

describe("lib/outbound-proxy — v1.0.6.7: پروکسی خاموش → fallback خودکار", () => {
  /** پورت ۱ روی 127.0.0.1 تقریباً همیشه ECONNREFUSED فوری می‌دهد — شبیه‌سازی v2rayN خاموش */
  const DEAD_PROXY = "socks5://127.0.0.1:1";

  it("پروکسی خاموش (ECONNREFUSED) → خودکار مستقیم + via=direct — fetch صدا زده می‌شود", async () => {
    process.env.OUTBOUND_PROXY_URL = DEAD_PROXY;
    resetOutboundAgentForTests();
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "POST",
      headers: {},
      body: "{}",
    });
    // درخواست از fetch (مسیر مستقیم) رفت — نه از پروکسیِ مرده
    expect(r.kind).toBe("http");
    if (r.kind === "http") {
      expect(r.status).toBe(200);
      expect(r.via).toBe("direct");
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/v1");
  });

  it("پروبِ پروکسی خاموش → reachable=false با جزئیات ECONNREFUSED", async () => {
    process.env.OUTBOUND_PROXY_URL = DEAD_PROXY;
    resetOutboundAgentForTests();
    const probe = await probeOutboundProxy();
    expect(probe.reachable).toBe(false);
    expect(probe.detail).toContain("ECONNREFUSED");
    expect(probe.detail).toContain("127.0.0.1:1");
  });

  it("forceDirect → مستقیم، حتی اگر پروکسی تنظیم شده باشد", async () => {
    process.env.OUTBOUND_PROXY_URL = DEAD_PROXY;
    resetOutboundAgentForTests();
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "GET",
      headers: {},
      forceDirect: true,
    });
    expect(r.kind).toBe("http");
    if (r.kind === "http") expect(r.via).toBe("direct");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("بدون پروکسی → بدون فیلد via (سازگاری خروجی قبلی)", async () => {
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "GET",
      headers: {},
    });
    expect(r).toEqual({ kind: "http", ok: true, status: 200, bodyText: "ok-body" });
  });

  it("پروکسی نامعتبر (ftp) → هشدار + مسیر مستقیم، اپ نمی‌شکند", async () => {
    process.env.OUTBOUND_PROXY_URL = "ftp://1.2.3.4:21";
    resetOutboundAgentForTests();
    const r = await outboundRequest("https://api.example.com/v1", {
      method: "GET",
      headers: {},
    });
    expect(r.kind).toBe("http");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/notify/diagnose — کلید SendGrid + پروکسی خاموش + 451 (سناریوی واقعی ۱.0.1.10)", () => {
  it("پروب در پاسخ + verdict دقیق «پروکسی تنظیم شده ولی پاسخ نمی‌دهد» + 451 مستقیم واقعی", async () => {
    process.env.OUTBOUND_PROXY_URL = "socks5://127.0.0.1:1"; // VPN خاموش
    process.env.SENDGRID_API_KEY = "SG.test";
    process.env.SENDGRID_FROM_EMAIL = "me@x.com";
    resetOutboundAgentForTests();

    // همهٔ فراخوانی‌های مستقیم 451 می‌گیرند (IP تحریمی شبیه‌سازی)
    fetchMock.mockImplementation(
      async () =>
        ({
          ok: false,
          status: 451,
          text: async () => "nope",
        }) as unknown as Response,
    );

    const res = await diagnoseGET(new NextRequest(DIAGNOSE_URL));
    expect(res.status).toBe(200);
    const body = await res.json();

    // پروبِ پروکسی در پاسخ هست و خاموش است
    expect(body.proxy.configured).toBe(true);
    expect(body.proxy.probe.reachable).toBe(false);
    expect(body.proxy.probe.detail).toContain("ECONNREFUSED");

    // «مستقیم» واقعاً مستقیم است و 451 گرفته
    expect(body.sendgrid.keyCheck.direct.status).toBe(451);
    // مسیر پیش‌فرض (باید از پروکسی می‌رفت) هم به fallback مستقیم 451 گرفت
    expect(body.sendgrid.keyCheck.viaProxy.tested).toBe(true);
    expect(body.sendgrid.keyCheck.viaProxy.status).toBe(451);

    // verdict خطای «پروکسی خاموش» باید باشد
    const fa = (body.verdicts as Array<{ level: string; fa: string }>)
      .map((v) => v.fa)
      .join("\n");
    expect(fa).toContain("پاسخ نمی‌دهد");
    expect(fa).toContain("VPN");
  });
});

describe("GET /api/notify/diagnose — بدون هیچ کلیدی", () => {
  it("فقط verdictهای «تنظیم نشده» + هیچ فراخوانی شبکه", async () => {
    const res = await diagnoseGET(new NextRequest(DIAGNOSE_URL));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.sendgrid.configured).toBe(false);
    expect(body.onesignal.configured).toBe(false);
    expect(body.proxy.configured).toBe(false);
    // بدون کلید → هیچ درخواست خارجی نباید زده شود
    expect(fetchMock).not.toHaveBeenCalled();
    const levels = (body.verdicts as Array<{ level: string }>).map((v) => v.level);
    expect(levels.every((l) => l === "info")).toBe(true);
    expect((body.verdicts as Array<{ fa: string }>)[0].fa).toContain("SendGrid");
  });
});
