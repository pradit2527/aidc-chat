// GET /api/health — สถานะการตั้งค่าและการเข้าถึง Chatwoot (ต้องไม่คืนค่า token)
import { GET } from "@/app/api/health/route";

const fetchMock = jest.fn();
beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe("GET /api/health", () => {
  test("Chatwoot ตอบ /api ปกติ → ok=true พร้อมเวอร์ชัน และรายงานว่าตั้งค่าครบ (ไม่มีค่าลับ)", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ version: "4.17.1" }), { status: 200 }));
    const j = await (await GET()).json();
    expect(j).toMatchObject({
      ok: true,
      baseUrl: "http://chatwoot.test",
      chatwoot: { reachable: true, version: "4.17.1" },
      configured: { websiteToken: true, hmacToken: true, sessionSecret: true },
      host: { vercel: false },
    });
    expect(JSON.stringify(j)).not.toContain("unit-hmac-token");
    expect(JSON.stringify(j)).not.toContain("unit-website-token");
    expect(fetchMock.mock.calls[0][0]).toBe("http://chatwoot.test/api");
  });

  test("Chatwoot ล่ม/timeout → ok=false, reachable=false แต่ยังตอบ 200", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: false, chatwoot: { reachable: false } });
  });

  test("Chatwoot ตอบ 500 → reachable=false", async () => {
    fetchMock.mockResolvedValue(new Response("x", { status: 500 }));
    expect(await (await GET()).json()).toMatchObject({ ok: false, chatwoot: { reachable: false } });
  });

  test("ไม่มี website token หรือ SESSION_SECRET สั้น → ok=false และบอกว่าตัวไหนขาด", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ version: "4.17.1" }), { status: 200 }));
    const prevW = process.env.CHATWOOT_WEBSITE_TOKEN;
    const prevS = process.env.SESSION_SECRET;
    try {
      process.env.CHATWOOT_WEBSITE_TOKEN = "";
      expect(await (await GET()).json()).toMatchObject({ ok: false, configured: { websiteToken: false, sessionSecret: true } });
      process.env.CHATWOOT_WEBSITE_TOKEN = prevW;
      process.env.SESSION_SECRET = "short";
      expect(await (await GET()).json()).toMatchObject({ ok: false, configured: { websiteToken: true, sessionSecret: false } });
    } finally {
      process.env.CHATWOOT_WEBSITE_TOKEN = prevW;
      process.env.SESSION_SECRET = prevS;
    }
  });

  test("บน Vercel → host.vercel=true พร้อม env/url", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ version: "4.17.1" }), { status: 200 }));
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "aidc-chat.vercel.app";
    try {
      expect(await (await GET()).json()).toMatchObject({ host: { vercel: true, env: "production", url: "aidc-chat.vercel.app" } });
    } finally {
      delete process.env.VERCEL;
      delete process.env.VERCEL_ENV;
      delete process.env.VERCEL_URL;
    }
  });
});
