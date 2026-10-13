// POST /api/admin/login — ล็อกอินด้วยบัญชี Chatwoot แล้วออกคุกกี้เซสชันที่เข้ารหัส
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/login/route";
import { unsealSession } from "@/lib/session";

const fetchMock = jest.fn();
beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

const call = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://console.local/api/admin/login", {
      method: "POST",
      headers: { host: "console.local", "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }) as unknown as NextRequest,
  );

const chatwootOk = (accounts = [{ id: 1, name: "AIDC-TECH" }]) =>
  new Response(JSON.stringify({ data: { id: 1, name: "Pradit", email: "it@example.invalid", accounts } }), {
    status: 200,
    headers: { "access-token": "tok", client: "cli", uid: "it@example.invalid" },
  });

describe("POST /api/admin/login", () => {
  test("Origin ไม่ตรง → 403 และไม่เรียก Chatwoot", async () => {
    const res = await call({ email: "a@b", password: "x" }, { origin: "http://evil.local" });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    ["ไม่มีอีเมล", { password: "x" }],
    ["ไม่มีรหัสผ่าน", { email: "a@b" }],
    ["อีเมลยาวเกิน 200", { email: "a".repeat(201), password: "x" }],
    ["body ไม่ใช่ JSON", "{bad"],
  ])("%s → 400 invalid_credentials โดยไม่เรียก Chatwoot", async (_label, body) => {
    const res = await call(body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_credentials" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("Chatwoot ปฏิเสธ (401) → 401 invalid_credentials ไม่ออกคุกกี้", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));
    const res = await call({ email: "a@b", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  test("Chatwoot ติดต่อไม่ได้ → 502 chatwoot_unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await call({ email: "a@b", password: "x" });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "chatwoot_unreachable" });
  });

  test("Chatwoot ตอบ 200 แต่ไม่มี token header → 502 chatwoot_error", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: { accounts: [{ id: 1 }] } }), { status: 200 }));
    expect((await call({ email: "a@b", password: "x" })).status).toBe(502);
  });

  test("ผู้ใช้ไม่ได้อยู่ใน account 1 → 403 (บัญชี Chatwoot อื่นล็อกอินไม่ได้)", async () => {
    fetchMock.mockResolvedValue(chatwootOk([{ id: 2, name: "Other" }]));
    expect((await call({ email: "a@b", password: "x" })).status).toBe(403);
  });

  test("สำเร็จ → คืน user และออกคุกกี้ httpOnly ที่ถอดได้เป็นเซสชันพร้อม token ของ Chatwoot", async () => {
    fetchMock.mockResolvedValue(chatwootOk());
    const res = await call({ email: "  it@example.invalid ", password: "pw" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: { id: 1, name: "Pradit", email: "it@example.invalid" } });
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^cosi_admin=/);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(cookie.toLowerCase()).not.toContain("secure"); // http ในเครื่อง → ไม่ใส่ Secure
    const value = cookie.split(";")[0].slice("cosi_admin=".length);
    const s = unsealSession(value);
    expect(s).toMatchObject({ token: "tok", client: "cli", uid: "it@example.invalid", user: { name: "Pradit" } });
    expect(s!.exp).toBeGreaterThan(Date.now() + 11 * 3600 * 1000);
    // ส่งอีเมลที่ตัดช่องว่างแล้วไปให้ Chatwoot และไม่เก็บรหัสผ่านไว้ในคุกกี้
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "it@example.invalid", password: "pw" });
    expect(JSON.stringify(s)).not.toContain("pw");
  });

  test("ผ่าน https (x-forwarded-proto) → คุกกี้มี Secure", async () => {
    fetchMock.mockResolvedValue(chatwootOk());
    const res = await call({ email: "a@b", password: "x" }, { "x-forwarded-proto": "https" });
    expect((res.headers.get("set-cookie") ?? "").toLowerCase()).toContain("secure");
  });

  test("SESSION_SECRET ไม่ถูกตั้ง → 500 server_not_configured (ก่อนเรียก Chatwoot)", async () => {
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "short";
    try {
      // ใช้ IP แยก เพื่อไม่ชนตัวจำกัดจำนวนครั้ง (เทสก่อนหน้าในไฟล์นี้ใช้โควตาของ IP "local" ไปแล้ว)
      const res = await call({ email: "a@b", password: "x" }, { "x-forwarded-for": "203.0.113.50" });
      expect(res.status).toBe(500);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      process.env.SESSION_SECRET = prev;
    }
  });

  test("จำกัดความถี่: IP เดียวกันครั้งที่ 11 ภายใน 5 นาที → 429", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));
    for (let i = 0; i < 10; i++) {
      expect((await call({ email: "a@b", password: "wrong" }, { "x-forwarded-for": "203.0.113.9, 10.0.0.1" })).status).toBe(401);
    }
    const res = await call({ email: "a@b", password: "wrong" }, { "x-forwarded-for": "203.0.113.9" });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "too_many_attempts" });
    // IP อื่นยังล็อกอินได้
    expect((await call({ email: "a@b", password: "wrong" }, { "x-forwarded-for": "203.0.113.10" })).status).toBe(401);
  });
});
