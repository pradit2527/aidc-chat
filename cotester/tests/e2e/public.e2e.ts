// ฝั่งสาธารณะ: หน้าเว็บ, health, ล็อกอิน/ลงทะเบียนพนักงาน, ภาษา, และการป้องกันข้อมูลลับ — ไม่ต้องล็อกอิน
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { BASE, Client } from "./client";

const c = new Client();
// พนักงานที่ลงทะเบียน+ล็อกอินแล้ว (หน้า /start /chat /report ต้องล็อกอิน)
const u = new Client();
const USERNAME = `e2e.${randomBytes(4).toString("hex")}`;
beforeAll(async () => {
  const r = await u.post("/api/auth/register", { username: USERNAME, password: "e2e-pass-1", name: "Test Staff", department: "front-office", contact: "101" });
  if (r.status !== 201) throw new Error(`ลงทะเบียนผู้ใช้ทดสอบไม่สำเร็จ: ${r.status} ${r.text}`);
});
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
  test("/ = โปสเตอร์ QR ชี้ไปหน้าล็อกอิน /login", async () => {
    const r = await c.get("/");
    expect(r.status).toBe(200);
    expect(r.text).toMatch(/https?:\/\/[^"<]+\/login/); // บน localhost โปสเตอร์ใช้ IP ของเครื่องแทน
  });

  test("ยังไม่ล็อกอิน: /start /chat /report เด้งไป /login?next=…", async () => {
    for (const p of ["/start", "/chat", "/report"]) {
      const r = await c.get(p);
      expect([301, 302, 307, 308]).toContain(r.status);
      expect(r.redirect).toContain(`/login?next=${encodeURIComponent(p)}`);
    }
    const login = await c.get("/login");
    expect(login.status).toBe(200);
    expect(login.text).toContain('href="/register"');
    expect(login.text).toMatch(/type="password"/);
  });

  test("ล็อกอินแล้ว: /start และ /report เปิดได้ (ภาษาลาว) และแสดงชื่อจากบัญชี; /login เด้งไป /start", async () => {
    const start = await u.get("/start");
    expect(start.text).toContain("ລະບົບການແຈ້ງບັນຫາ");
    expect(start.text).toContain("Test Staff");
    expect((await u.get("/report")).text).toContain("ແຈ້ງບັນຫາ");
    const l = await u.get("/login");
    expect([301, 302, 307, 308]).toContain(l.status);
    expect(l.redirect).toContain("/start");
  });

  test("/?tools=1 เปิดเครื่องมือพิมพ์ได้", async () => {
    expect((await c.get("/?tools=1")).status).toBe(200);
  });

  test("/chat ภาษาลาว: ชื่อระบบ, ขั้นตอน 1–2, หัวข้อปัญหาครบ 7, ช่องด่วน", async () => {
    const r = await u.get("/chat");
    expect(r.status).toBe(200);
    for (const s of [
      "ລະບົບການແຈ້ງບັນຫາ",
      "1. ຜູ້ໃຊ້ງານ",
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
    const r = await u.get("/chat");
    if (envLocal.CHATWOOT_HMAC_TOKEN) expect(r.text).not.toContain(envLocal.CHATWOOT_HMAC_TOKEN);
    expect(r.text).not.toMatch(/npg_[A-Za-z0-9]+/);
    expect(r.text).not.toContain("SESSION_SECRET=");
  });

  test("คุกกี้ lang=en → หน้า /chat เป็นภาษาอังกฤษ", async () => {
    const en = new Client();
    en.setCookie("lang", "en");
    en.setCookie("cosi_user", u.cookie("cosi_user") ?? "");
    const r = await en.get("/chat");
    expect(r.text).toContain("Problem Reporting System");
    expect(r.text).toContain("Wi-Fi / Internet");
  });

  test("/admin และ /admin/chat ยังไม่ล็อกอิน = หน้าล็อกอินแบรนด์ IT Helpdesk ที่ไม่ให้ search engine เก็บ", async () => {
    for (const p of ["/admin", "/admin/chat"]) {
      const r = await c.get(p);
      expect(r.status).toBe(200);
      expect(r.text).toContain("IT Helpdesk");
      expect(r.text).toMatch(/type="password"/);
      expect(r.text).toMatch(/noindex/);
    }
  });

  test.each([
    ["/qr", "/"],
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

describe("ลงทะเบียน / ล็อกอินพนักงาน (/api/auth/*)", () => {
  const body = { password: "e2e-pass-1", name: "Auth Staff", department: "front-office", contact: "101" };
  const name = `auth.${randomBytes(4).toString("hex")}`;

  test("ลงทะเบียน → ได้ identifier + HMAC ที่ตรงกับ token ของเซิร์ฟเวอร์ และตั้งคุกกี้เซสชัน", async () => {
    const k = new Client();
    const r = await k.post("/api/auth/register", { username: name, ...body });
    expect(r.status).toBe(201);
    const j = (r.json as { profile: Record<string, string> }).profile;
    expect(j.identifier).toMatch(/^cosi_[0-9a-f]{24}$/);
    expect(j.departmentLabel).toBe("Front Office");
    expect(k.cookie("cosi_user")).toBeTruthy();
    if (envLocal.CHATWOOT_HMAC_TOKEN) {
      expect(j.identifierHash).toBe(createHmac("sha256", envLocal.CHATWOOT_HMAC_TOKEN).update(j.identifier).digest("hex"));
    } else {
      expect(j.identifierHash).toMatch(/^[0-9a-f]{64}$/);
    }
  });
  test("username ซ้ำ (ไม่สนตัวพิมพ์) → 409, รหัสผ่านสั้น/username ผิดรูปแบบ/ขาดชื่อ/แผนกผิด → 400", async () => {
    expect((await c.post("/api/auth/register", { username: name.toUpperCase(), ...body })).status).toBe(409);
    expect((await c.post("/api/auth/register", { username: "ok.user", ...body, password: "123" })).json).toEqual({ error: "password_invalid" });
    expect((await c.post("/api/auth/register", { username: "A B", ...body })).json).toEqual({ error: "username_invalid" });
    expect((await c.post("/api/auth/register", { username: "ok.user", ...body, name: " " })).json).toEqual({ error: "name_required" });
    expect((await c.post("/api/auth/register", { username: "ok.user", ...body, department: "nope" })).json).toEqual({ error: "department_required" });
  });
  test("ล็อกอินด้วยรหัสผ่านถูก → 200 + คุกกี้; ผิด/ไม่มีผู้ใช้ → 401 ข้อความเดียวกัน", async () => {
    const k = new Client();
    expect((await k.post("/api/auth/login", { username: name, password: body.password })).status).toBe(200);
    expect(k.cookie("cosi_user")).toBeTruthy();
    const bad = await c.post("/api/auth/login", { username: name, password: "wrong-pass" });
    const none = await c.post("/api/auth/login", { username: "nobody.here", password: "wrong-pass" });
    expect(bad.status).toBe(401);
    expect(none.status).toBe(401);
    expect(bad.json).toEqual(none.json);
  });
  test("ออกจากระบบ → ลบคุกกี้ แล้ว /start เด้งกลับ /login; ข้ามต้นทาง → 403", async () => {
    const k = new Client();
    await k.post("/api/auth/login", { username: name, password: body.password });
    expect((await k.get("/start")).status).toBe(200);
    await k.post("/api/auth/logout", {});
    expect(k.cookie("cosi_user")).toBeUndefined();
    expect((await k.get("/start")).status).toBe(307);
    expect((await c.post("/api/auth/login", { username: name, password: body.password }, { origin: "http://evil.test" })).status).toBe(403);
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
