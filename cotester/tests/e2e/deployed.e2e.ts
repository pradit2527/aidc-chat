// smoke test ระบบที่ติดตั้งแล้ว (อ่านอย่างเดียว) — รันเมื่อมี E2E_DEPLOYED_URL เท่านั้น
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

  test("หน้า /, /chat, /admin เปิดได้และไม่ขึ้นข้อความ 'ยังไม่ได้ตั้งค่า'", async () => {
    for (const p of ["/", "/chat", "/admin"]) {
      const r = await c.get(p);
      expect(r.status).toBe(200);
      expect(r.text).not.toContain("ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ");
    }
    expect((await c.get("/chat")).text).toContain("ລະບົບການແຈ້ງບັນຫາ");
    expect((await c.get("/admin")).text).toContain("IT Helpdesk");
  });

  test("QR บนหน้าแรกชี้ไปหน้าหลักพนักงาน /start ของโฮสต์นี้ และ /start, /report เปิดได้", async () => {
    expect((await c.get("/")).text).toContain(`${URL}/start`);
    expect((await c.get("/start")).status).toBe(200);
    expect((await c.get("/report")).status).toBe(200);
  });

  test("API คอนโซลยังปิดสำหรับคนที่ไม่ล็อกอิน และสถิติเด้งไปหน้าล็อกอิน", async () => {
    expect((await c.get("/api/admin/me")).status).toBe(401);
    expect((await c.get("/api/admin/stats")).status).toBe(401);
    const r = await c.get("/admin/stats");
    expect([301, 302, 307, 308]).toContain(r.status);
    expect(["/admin", `${URL}/admin`]).toContain(r.redirect);
  });

  test("ตอบสนองภายใน 3 วินาที", async () => {
    const t = Date.now();
    await c.get("/chat");
    expect(Date.now() - t).toBeLessThan(3000);
  });
});
