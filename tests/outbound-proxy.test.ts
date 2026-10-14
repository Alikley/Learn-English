import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// لایهٔ «پروکسی خروجی» + روت تشخیص خودکار
// (v1.0.6.6 / English 1.0.1.9)
//
//  - classifyProxy: socks5/socks4/http/https/نامعتبر
//  - describeProxy: ماسک کردن user:pass
//  - outboundRequest بدون OUTBOUND_PROXY_URL → fetch (رفتار قبلی)
//  - GET /api/notify/diagnose بدون هیچ کلیدی → فقط verdictهای
//    «تنظیم نشده» بدون هیچ فراخوانی شبکه
// ========================================

vi.mock("@/prisma/Prisma client", async () => {
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
