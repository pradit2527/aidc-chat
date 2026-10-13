// ตัวห่อ route ของคอนโซล: เซสชัน, CSRF, แปลง error, จำกัดจำนวนล็อกอิน
jest.mock("@/lib/session", () => ({
  SESSION_COOKIE: "cosi_admin",
  getSession: jest.fn(),
}));

import { adminRoute, isHttps, loginAllowed, parseId, sameOrigin } from "@/lib/adminApi";
import { CwError } from "@/lib/cw";
import { getSession } from "@/lib/session";

const mockedGetSession = getSession as jest.MockedFunction<typeof getSession>;
const session = {
  token: "t",
  client: "c",
  uid: "u",
  user: { id: 7, name: "Pradit", email: "p@example.invalid" },
  exp: Date.now() + 1000,
};
const req = (method = "GET", headers: Record<string, string> = {}) =>
  new Request("http://console.local/api/admin/x", { method, headers: { host: "console.local", ...headers } });

describe("sameOrigin — กัน CSRF", () => {
  test("ไม่มี Origin (เช่น fetch จากหน้าเดียวกันแบบ GET) → ผ่าน", () => {
    expect(sameOrigin(req())).toBe(true);
  });
  test("Origin ตรงกับ Host → ผ่าน", () => {
    expect(sameOrigin(req("POST", { origin: "http://console.local" }))).toBe(true);
  });
  test("Origin ต่างโฮสต์/ต่างพอร์ต → ไม่ผ่าน", () => {
    expect(sameOrigin(req("POST", { origin: "http://evil.local" }))).toBe(false);
    expect(sameOrigin(req("POST", { origin: "http://console.local:9999" }))).toBe(false);
  });
  test("อยู่หลัง proxy: ใช้ x-forwarded-host ก่อน host", () => {
    expect(sameOrigin(req("POST", { origin: "https://aidc-chat.vercel.app", "x-forwarded-host": "aidc-chat.vercel.app" }))).toBe(true);
  });
  test("Origin ไม่ใช่ URL → ไม่ผ่าน", () => {
    expect(sameOrigin(req("POST", { origin: "garbage" }))).toBe(false);
  });
});

describe("isHttps", () => {
  test("x-forwarded-proto https หรือ URL https → true", () => {
    expect(isHttps(req("GET", { "x-forwarded-proto": "https" }))).toBe(true);
    expect(isHttps(new Request("https://x.test/"))).toBe(true);
  });
  test("http ธรรมดา → false", () => expect(isHttps(req())).toBe(false));
});

describe("parseId", () => {
  test.each([
    ["19", 19],
    ["000123", 123],
    ["123456789012", 123456789012],
    ["1234567890123", null],
    ["abc", null],
    ["-1", null],
    ["1.5", null],
    ["", null],
    ["19 ", null],
  ])("%p → %p", (input, expected) => expect(parseId(input)).toBe(expected));
});

describe("loginAllowed — จำกัด 10 ครั้งต่อ IP ต่อ 5 นาที", () => {
  test("ครั้งที่ 1–10 ผ่าน ครั้งที่ 11 ถูกบล็อก และ IP อื่นไม่กระทบ", () => {
    for (let i = 1; i <= 10; i++) expect(loginAllowed("10.0.0.1")).toBe(true);
    expect(loginAllowed("10.0.0.1")).toBe(false);
    expect(loginAllowed("10.0.0.2")).toBe(true);
  });
  test("หมดช่วง 5 นาทีแล้วนับใหม่", () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, "now").mockReturnValue(now);
    for (let i = 0; i < 11; i++) loginAllowed("10.0.0.3");
    expect(loginAllowed("10.0.0.3")).toBe(false);
    spy.mockReturnValue(now + 5 * 60_000 + 1);
    expect(loginAllowed("10.0.0.3")).toBe(true);
    spy.mockRestore();
  });
});

describe("adminRoute", () => {
  beforeEach(() => mockedGetSession.mockReset());

  test("ไม่มีเซสชัน → 401 unauthorized", async () => {
    mockedGetSession.mockResolvedValue(null);
    const res = await adminRoute(req(), async () => ({ ok: true }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  test("อ่านเซสชันไม่ได้ (เช่น ไม่มี SESSION_SECRET) → 500 server_not_configured", async () => {
    mockedGetSession.mockRejectedValue(new Error("SESSION_SECRET ยังไม่ได้ตั้งค่า"));
    const res = await adminRoute(req(), async () => ({ ok: true }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "server_not_configured" });
  });

  test("มีเซสชัน → ส่ง session ให้ handler และคืน JSON 200", async () => {
    mockedGetSession.mockResolvedValue(session);
    const handler = jest.fn(async (s: typeof session) => ({ who: s.user.name }));
    const res = await adminRoute(req(), handler);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ who: "Pradit" });
    expect(handler).toHaveBeenCalledWith(session);
  });

  test("mutating + Origin ไม่ตรง → 403 ก่อนตรวจเซสชันด้วยซ้ำ", async () => {
    mockedGetSession.mockResolvedValue(session);
    const res = await adminRoute(req("POST", { origin: "http://evil.local" }), async () => ({}), { mutating: true });
    expect(res.status).toBe(403);
    expect(mockedGetSession).not.toHaveBeenCalled();
  });

  test("mutating + Origin ตรง → ทำงานปกติ", async () => {
    mockedGetSession.mockResolvedValue(session);
    const res = await adminRoute(req("POST", { origin: "http://console.local" }), async () => ({ ok: 1 }), { mutating: true });
    expect(res.status).toBe(200);
  });

  test("Chatwoot ตอบ 401 (token หมดอายุ) → 401 และลบคุกกี้เซสชัน", async () => {
    mockedGetSession.mockResolvedValue(session);
    const res = await adminRoute(req(), async () => {
      throw new CwError(401, "chatwoot 401");
    });
    expect(res.status).toBe(401);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/cosi_admin=;?/);
    expect(setCookie.toLowerCase()).toMatch(/max-age=0|expires=/);
  });

  test("Chatwoot ตอบ 4xx อื่น → ส่งสถานะเดิม (404)", async () => {
    mockedGetSession.mockResolvedValue(session);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await adminRoute(req(), async () => {
      throw new CwError(404, "chatwoot 404");
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "chatwoot_error" });
    spy.mockRestore();
  });

  test("Chatwoot ล่ม (5xx) หรือ error ทั่วไป → 502", async () => {
    mockedGetSession.mockResolvedValue(session);
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect((await adminRoute(req(), async () => { throw new CwError(503, "down"); })).status).toBe(502);
    expect((await adminRoute(req(), async () => { throw new Error("boom"); })).status).toBe(502);
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
