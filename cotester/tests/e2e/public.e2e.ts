// ฝั่งสาธารณะ: หน้าเว็บ, health, identify, ภาษา, และการป้องกันข้อมูลลับ — ไม่ต้องล็อกอิน
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { BASE, Client } from "./client";

const c = new Client();
const envLocal = (() => {
  try {
    return Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split(/\r?\n/)
        .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
        .filter((m): m is RegExpMatchArray => !!m)
        .map((m) => [m[1], m[2]]),
    );
  } catch {
    return {} as Record<string, string>;
  }
})();

describe("GET /api/health", () => {
  test("พร้อมใช้งาน: ตั้งค่าครบ เข้าถึง Chatwoot ได้ และไม่มีค่าลับในคำตอบ", async () => {
    const r = await c.get("/api/health");
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({
      ok: true,
      chatwoot: { reachable: true },
      configured: { websiteToken: true, hmacToken: true, sessionSecret: true },
    });
    if (envLocal.CHATWOOT_HMAC_TOKEN) expect(r.text).not.toContain(envLocal.CHATWOOT_HMAC_TOKEN);
    expect(r.text).not.toMatch(/npg_[A-Za-z0-9]+/);
  });
});

describe("หน้าเว็บสาธารณะ", () => {
  test("/ = โปสเตอร์ QR ชี้ไปหน้าหลักพนักงาน /start", async () => {
    const r = await c.get("/");
    expect(r.status).toBe(200);
    expect(r.text).toMatch(/https?:\/\/[^"<]+\/start/); // บน localhost โปสเตอร์ใช้ IP ของเครื่องแทน
  });

  test("/start และ /report เปิดได้ (ภาษาลาว)", async () => {
    expect((await c.get("/start")).text).toContain("ເລືອກບໍລິການ");
    expect((await c.get("/report")).text).toContain("ແຈ້ງບັນຫາ");
  });

  test("/?tools=1 เปิดเครื่องมือพิมพ์ได้", async () => {
    expect((await c.get("/?tools=1")).status).toBe(200);
  });

  test("/chat ภาษาลาว: ชื่อระบบ, ขั้นตอน 1–2, หัวข้อปัญหาครบ 7, ช่องด่วน", async () => {
    const r = await c.get("/chat");
    expect(r.status).toBe(200);
    for (const s of [
      "ລະບົບການແຈ້ງບັນຫາ",
      "1. ກະລຸນາກອກຂໍ້ມູນ",
      "2. ເລືອກຫົວຂໍ້ບັນຫາ",
      "Wi-Fi / ອິນເຕີເນັດ",
      "ຄອມພິວເຕີ / ເຄື່ອງພິມ",
      "ລະບົບໂຮງແຮມ (PMS / POS)",
      "ອີເມວ / ບັນຊີຜູ້ໃຊ້",
      "ກ້ອງວົງຈອນປິດ / ລະບົບປະຕູ",
      "ໂທລະສັບ / ໂທລະທັດ",
      "ອື່ນໆ",
      "ດ່ວນ",
    ]) {
      expect(r.text).toContain(s);
    }
  });

  test("/chat ไม่รั่ว HMAC token และ connection string ลงหน้าเว็บ", async () => {
    const r = await c.get("/chat");
    if (envLocal.CHATWOOT_HMAC_TOKEN) expect(r.text).not.toContain(envLocal.CHATWOOT_HMAC_TOKEN);
    expect(r.text).not.toMatch(/npg_[A-Za-z0-9]+/);
    expect(r.text).not.toContain("SESSION_SECRET=");
  });

  test("คุกกี้ lang=en → หน้า /chat เป็นภาษาอังกฤษ", async () => {
    const en = new Client();
    en.setCookie("lang", "en");
    const r = await en.get("/chat");
    expect(r.text).toContain("Problem Reporting System");
    expect(r.text).toContain("Wi-Fi / Internet");
  });

  test("/admin = หน้าล็อกอินแบรนด์ IT Helpdesk ที่ไม่ให้ search engine เก็บ", async () => {
    const r = await c.get("/admin");
    expect(r.status).toBe(200);
    expect(r.text).toContain("IT Helpdesk");
    expect(r.text).toMatch(/type="password"/);
    expect(r.text).toMatch(/noindex/);
  });

  test.each([
    ["/qr", "/"],
    ["/login", "/admin"],
    ["/admin/stats", "/admin"],
  ])("%s เด้งไป %s", async (from, to) => {
    const r = await c.get(from);
    expect([301, 302, 307, 308]).toContain(r.status);
    // Next ส่ง Location แบบสัมพัทธ์ในโหมด dev และแบบเต็มในบางสภาพแวดล้อม — รับทั้งสองแบบ
    expect([to, `${BASE}${to}`]).toContain(r.redirect);
  });

  test("เส้นทางที่ไม่มี → 404", async () => {
    expect((await c.get("/no-such-page")).status).toBe(404);
  });
});

describe("POST /api/identify (ตัวตนพนักงานสำหรับ widget)", () => {
  test("ข้อมูลถูกต้อง → identifier + HMAC ที่ตรงกับ token ของเซิร์ฟเวอร์", async () => {
    const r = await c.post("/api/identify", { name: "Test Staff", department: "front-office", contact: "101" });
    expect(r.status).toBe(200);
    const j = r.json as Record<string, string>;
    expect(j.identifier).toMatch(/^cosi_[0-9a-f]{24}$/);
    expect(j.departmentLabel).toBe("Front Office");
    if (envLocal.CHATWOOT_HMAC_TOKEN) {
      expect(j.identifierHash).toBe(createHmac("sha256", envLocal.CHATWOOT_HMAC_TOKEN).update(j.identifier).digest("hex"));
    } else {
      expect(j.identifierHash).toMatch(/^[0-9a-f]{64}$/);
    }
  });
  test("ขาดชื่อ/แผนกผิด → 400", async () => {
    expect((await c.post("/api/identify", { department: "front-office" })).status).toBe(400);
    expect((await c.post("/api/identify", { name: "A", department: "nope" })).status).toBe(400);
  });
});

describe("API คอนโซลเมื่อยังไม่ล็อกอิน", () => {
  test.each(["/api/admin/me", "/api/admin/conversations", "/api/admin/labels", "/api/admin/stats", "/api/admin/canned", "/api/admin/inbox"])(
    "GET %s → 401",
    async (p) => {
      const r = await c.get(p);
      expect(r.status).toBe(401);
      expect(r.json).toEqual({ error: "unauthorized" });
    },
  );
  test("POST ข้อความโดยไม่ล็อกอิน → 401; Origin แปลกปลอม → 403 (CSRF)", async () => {
    expect((await c.post("/api/admin/conversations/19/messages", { content: "x" })).status).toBe(401);
    expect((await c.post("/api/admin/conversations/19/messages", { content: "x" }, { origin: "http://evil.test" })).status).toBe(403);
  });
  test("GET /api/admin/conversations/abc/messages → 400 (id ไม่ถูกต้อง)", async () => {
    expect((await c.get("/api/admin/conversations/abc/messages")).status).toBe(400);
  });
});
