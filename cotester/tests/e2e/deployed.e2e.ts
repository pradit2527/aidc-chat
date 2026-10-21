// smoke test ระบบที่ติดตั้งแล้ว (อ่านอย่างเดียว) — รันเมื่อมี E2E_DEPLOYED_URL เท่านั้น
// บนเครื่องจริง: QR → /login (บัญชีพนักงาน) และระบบแชทซ่อนอยู่ (CHAT_ENABLED ไม่ได้ตั้ง) → /chat เด้งไป /start
import { Client } from "./client";

const URL = process.env.E2E_DEPLOYED_URL?.replace(/\/+$/, "");
const d = URL ? describe : describe.skip;

d(`ระบบที่ติดตั้งแล้ว: ${URL ?? "(ไม่ได้ตั้ง E2E_DEPLOYED_URL)"}`, () => {
  const c = new Client(URL ?? "http://invalid");

  test("health: ตั้งค่าครบและเชื่อม Chatwoot จริงได้", async () => {
    const r = await c.get("/api/health");
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ ok: true, chatwoot: { reachable: true }, configured: { websiteToken: true, hmacToken: true, sessionSecret: true } });
  });

  test("หน้า /, /login, /admin เปิดได้และไม่ขึ้นข้อความ 'ยังไม่ได้ตั้งค่า'", async () => {
    for (const p of ["/", "/login", "/admin"]) {
      const r = await c.get(p);
      expect(r.status).toBe(200);
      expect(r.text).not.toContain("ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ");
    }
    expect((await c.get("/admin")).text).toContain("IT Helpdesk");
  });

  test("QR บนหน้าแรกชี้ไปหน้าล็อกอิน /login ของโฮสต์นี้ และ /start, /report เด้งไปล็อกอินเมื่อยังไม่ล็อกอิน", async () => {
    expect((await c.get("/")).text).toContain(`${URL}/login`);
    for (const p of ["/start", "/report"]) {
      const r = await c.get(p);
      expect([301, 302, 307, 308]).toContain(r.status);
      expect(r.redirect).toContain("/login");
    }
  });

  test("ระบบแชทซ่อนอยู่: /chat → /start, /admin/chat → /admin", async () => {
    const chat = await c.get("/chat");
    expect([307, 308]).toContain(chat.status);
    expect(chat.redirect).toMatch(/\/start$/);
    const admin = await c.get("/admin/chat");
    expect([307, 308]).toContain(admin.status);
    expect(admin.redirect).toMatch(/\/admin$/);
  });

  test("API คอนโซลยังปิดสำหรับคนที่ไม่ล็อกอิน และหน้าสถิติ/WhatsApp เด้งไปหน้าล็อกอิน", async () => {
    expect((await c.get("/api/admin/me")).status).toBe(401);
    expect((await c.get("/api/admin/stats")).status).toBe(401);
    expect((await c.get("/api/admin/whatsapp")).status).toBe(401);
    for (const p of ["/admin/stats", "/admin/whatsapp"]) {
      const r = await c.get(p);
      expect([301, 302, 307, 308]).toContain(r.status);
      expect(["/admin", `${URL}/admin`]).toContain(r.redirect);
    }
  });

  test("ตอบสนองภายใน 3 วินาที", async () => {
    const t = Date.now();
    await c.get("/login");
    expect(Date.now() - t).toBeLessThan(3000);
  });
});
