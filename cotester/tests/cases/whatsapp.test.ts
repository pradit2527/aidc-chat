// แจ้งเตือน WhatsApp: เบอร์โทร, ค่าตั้ง Twilio, การเรียก Twilio (จำลอง fetch), ข้อความแจ้งงาน, สวิตช์ฟีเจอร์ — ไม่แตะเครือข่าย/ฐานข้อมูลจริง
import { chatEnabled, flagOn } from "@/lib/features";
import { normalizePhone, prettyPhone } from "@/lib/phone";
import type { ReportDTO } from "@/lib/reports";
import { deviceEnabled, waDevice } from "@/lib/waDevice";
import { isGroupJid, parseRecipients, refreshStatus, SANDBOX_FROM, sendToGroup, sendWhatsApp, whatsappStatus, type SendResult } from "@/lib/whatsapp";
import { formatReportNotice, formatTestNotice, WHATSAPP_BODY_MAX } from "@/lib/whatsappNotice";

const ENV = ["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY_SID", "TWILIO_API_KEY_SECRET", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "CHAT_ENABLED", "WHATSAPP_DEVICE"];
const saved: Record<string, string | undefined> = {};
beforeAll(() => {
  for (const k of ENV) saved[k] = process.env[k];
});
afterEach(() => {
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});
const clearTwilio = () => {
  for (const k of ENV) delete process.env[k];
};

describe("flagOn / chatEnabled (สวิตช์ฟีเจอร์)", () => {
  test.each([
    ["1", true],
    ["true", true],
    ["YES", true],
    ["on", true],
    ["0", false],
    ["false", false],
    ["", false],
    [undefined, false],
    ["  1 ", true],
  ])("flagOn(%p) = %p", (v, expected) => {
    expect(flagOn(v)).toBe(expected);
  });
  test("ค่าปกติไม่ตั้ง CHAT_ENABLED → ระบบแชทซ่อน; ตั้ง 1 → เปิด (อ่านตอนเรียก ไม่ใช่ตอน import)", () => {
    delete process.env.CHAT_ENABLED;
    expect(chatEnabled()).toBe(false);
    process.env.CHAT_ENABLED = "1";
    expect(chatEnabled()).toBe(true);
  });
});

describe("normalizePhone / prettyPhone", () => {
  test.each([
    ["+856 20 1234 5678", "+8562012345678"],
    ["020 1234 5678", "+8562012345678"], // ลาวแบบท้องถิ่น → +856
    ["0201234567", "+856201234567"],
    ["8562012345678", "+8562012345678"], // มีรหัสประเทศแล้ว ไม่มี +
    ["00856 20 1234 5678", "+8562012345678"],
    ["whatsapp:+66812345678", "+66812345678"],
    ["(+66) 81-234-5678", "+66812345678"],
    ["+1 415 523 8886", "+14155238886"],
  ])("%p → %p", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
  test.each(["", "   ", "abc", "+0123456789", "12345", "+8562012345678901234", null, undefined, 42])("ไม่ผ่านเกณฑ์: %p → null", (v) => {
    expect(normalizePhone(v)).toBeNull();
  });
  test("prettyPhone จัดช่องไฟเบอร์ลาว อื่น ๆ คงเดิม", () => {
    expect(prettyPhone("+8562012345678")).toBe("+856 20 1234 5678");
    expect(prettyPhone("+66812345678")).toBe("+66812345678");
  });
});

describe("parseRecipients / isGroupJid", () => {
  test("ตัดแถวที่เบอร์ผิด ตัดเบอร์ซ้ำ (หลังแปลง) ตัดชื่อยาว", () => {
    const list = parseRecipients([
      { phone: "020 1234 5678", label: "  IT   one " },
      { phone: "+8562012345678", label: "dup" },
      { phone: "bad", label: "x" },
      "nope",
      { phone: "+66812345678", label: "a".repeat(100) },
    ]);
    expect(list).toEqual([
      { phone: "+8562012345678", label: "IT one" },
      { phone: "+66812345678", label: "a".repeat(60) },
    ]);
    expect(parseRecipients(null)).toEqual([]);
    expect(parseRecipients({ phone: "+8562012345678" })).toEqual([]);
  });
  test("jid ของกลุ่ม WhatsApp = ตัวเลข(-ตัวเลข)?@g.us", () => {
    expect(isGroupJid("120363012345678901@g.us")).toBe(true);
    expect(isGroupJid("8562012345678-1600000000@g.us")).toBe(true);
    expect(isGroupJid("8562012345678@s.whatsapp.net")).toBe(false);
    expect(isGroupJid("nope")).toBe(false);
    expect(isGroupJid(null)).toBe(false);
  });
});

describe("whatsappStatus (Twilio)", () => {
  test("ไม่มีคีย์ → ไม่พร้อม บอกตัวแปรที่ขาด; ผู้ส่งเริ่มต้น = Sandbox", () => {
    clearTwilio();
    const s = whatsappStatus();
    expect(s.configured).toBe(false);
    expect(s.missing).toEqual(["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY_SID/TWILIO_API_KEY_SECRET"]);
    expect(s.from).toBe(SANDBOX_FROM);
    expect(s.sandbox).toBe(true);
  });
  test("API key ครบ → พร้อม; Auth Token แทนคู่ key/secret ก็ได้; ผู้ส่งที่ไม่มีคำนำหน้า whatsapp: ถูกเติมให้", () => {
    clearTwilio();
    process.env.TWILIO_ACCOUNT_SID = "AC" + "a".repeat(32);
    process.env.TWILIO_API_KEY_SID = "SK" + "b".repeat(32);
    process.env.TWILIO_API_KEY_SECRET = "secret";
    expect(whatsappStatus()).toMatchObject({ configured: true, sandbox: true, missing: [] });
    delete process.env.TWILIO_API_KEY_SID;
    delete process.env.TWILIO_API_KEY_SECRET;
    expect(whatsappStatus().configured).toBe(false);
    process.env.TWILIO_AUTH_TOKEN = "tok";
    process.env.TWILIO_WHATSAPP_FROM = "+8562099999999";
    expect(whatsappStatus()).toMatchObject({ configured: true, sandbox: false, from: "whatsapp:+8562099999999" });
    process.env.TWILIO_ACCOUNT_SID = "not-an-sid";
    expect(whatsappStatus().missing).toEqual(["TWILIO_ACCOUNT_SID"]);
  });
});

describe("sendWhatsApp / refreshStatus (จำลอง Twilio ด้วย fetch ปลอม)", () => {
  const realFetch = global.fetch;
  const calls: { url: string; init: RequestInit }[] = [];
  let reply: () => Response;
  beforeEach(() => {
    calls.length = 0;
    clearTwilio();
    process.env.TWILIO_ACCOUNT_SID = "AC" + "a".repeat(32);
    process.env.TWILIO_API_KEY_SID = "SK" + "b".repeat(32);
    process.env.TWILIO_API_KEY_SECRET = "s3cret";
    global.fetch = ((url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Promise.resolve(reply());
    }) as typeof fetch;
  });
  afterAll(() => {
    global.fetch = realFetch;
  });

  test("ส่งสำเร็จ → ok, sid, สถานะ queued; คำขอ: POST Messages.json, Basic auth ด้วย key SID:secret, From/To/Body", async () => {
    reply = () => new Response(JSON.stringify({ sid: "SM123", status: "queued", error_code: null }), { status: 201 });
    const r = await sendWhatsApp("+8562012345678", "hello");
    expect(r).toEqual({ channel: "twilio", to: "+8562012345678", ok: true, sid: "SM123", status: "queued", code: null, message: "" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`https://api.twilio.com/2010-04-01/Accounts/AC${"a".repeat(32)}/Messages.json`);
    expect(calls[0].init.method).toBe("POST");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.authorization).toBe("Basic " + Buffer.from(`SK${"b".repeat(32)}:s3cret`).toString("base64"));
    const body = calls[0].init.body as URLSearchParams;
    expect(body.get("From")).toBe(SANDBOX_FROM);
    expect(body.get("To")).toBe("whatsapp:+8562012345678");
    expect(body.get("Body")).toBe("hello");
  });
  test("Twilio ปฏิเสธ (401 คีย์ผิด) → ok:false status rejected พร้อมรหัส/ข้อความของ Twilio", async () => {
    reply = () => new Response(JSON.stringify({ code: 20003, message: "Authenticate", status: 401 }), { status: 401 });
    const r = await sendWhatsApp("+8562012345678", "x");
    expect(r).toMatchObject({ ok: false, status: "rejected", code: 20003, message: "Authenticate", sid: null });
  });
  test("เครือข่ายล้ม → status error ไม่โยน", async () => {
    reply = () => {
      throw new Error("ECONNRESET");
    };
    const r = await sendWhatsApp("+8562012345678", "x");
    expect(r).toMatchObject({ ok: false, status: "error", message: "ECONNRESET" });
  });
  test("ไม่ได้ตั้งค่า → not_configured โดยไม่เรียกเครือข่าย", async () => {
    clearTwilio();
    const r = await sendWhatsApp("+8562012345678", "x");
    expect(r).toMatchObject({ ok: false, status: "not_configured" });
    expect(calls).toHaveLength(0);
  });
  test("refreshStatus: Twilio บอก failed 63016 (นอกช่วง 24 ชม.) → ok:false พร้อมรหัส; ถามไม่ได้ → คืนค่าเดิม", async () => {
    const sent: SendResult = { channel: "twilio", to: "+8562012345678", ok: true, sid: "SM1", status: "queued", code: null, message: "" };
    reply = () => new Response(JSON.stringify({ sid: "SM1", status: "failed", error_code: 63016, error_message: "outside window" }), { status: 200 });
    expect(await refreshStatus(sent)).toMatchObject({ ok: false, status: "failed", code: 63016, message: "outside window" });
    expect(calls[0].url).toContain("/Messages/SM1.json");
    reply = () => new Response("nope", { status: 500 });
    expect(await refreshStatus(sent)).toEqual(sent);
    expect(await refreshStatus({ ...sent, sid: null })).toEqual({ ...sent, sid: null });
  });
});

describe("กลุ่ม (อุปกรณ์ที่เชื่อมต่อ) — ไม่แตะ WhatsApp จริง", () => {
  test("WHATSAPP_DEVICE ไม่ตั้ง → ปิด สถานะ off และส่งเข้ากลุ่มได้ not_configured", async () => {
    delete process.env.WHATSAPP_DEVICE;
    expect(deviceEnabled()).toBe(false);
    expect(waDevice().getState()).toMatchObject({ enabled: false, status: "off", qr: null, me: null, queued: 0 });
    expect(await sendToGroup({ jid: "1@g.us", name: "IT" }, "x")).toMatchObject({ channel: "group", to: "IT", ok: false, status: "not_configured" });
  });
  test("เปิดแต่ยังไม่สแกน → not_linked (ไม่ค้างในคิว)", async () => {
    process.env.WHATSAPP_DEVICE = "1";
    expect(waDevice().getState()).toMatchObject({ enabled: true, status: "idle" });
    const r = await sendToGroup({ jid: "1@g.us", name: "" }, "x");
    expect(r).toMatchObject({ channel: "group", to: "1@g.us", ok: false, status: "not_linked" });
    expect(waDevice().getState().queued).toBe(0);
  });
});

describe("formatReportNotice / formatTestNotice", () => {
  const NOON_LAO = Date.UTC(2026, 9, 20, 5) / 1000; // 2026-10-20 05:00 UTC = 12:00 เวลาลาว (UTC+7)
  const report: ReportDTO = {
    id: 12,
    ticketNo: "Ticket19-10-2026-003",
    name: "ສົມຊາຍ ວົງສາ",
    department: "front-office",
    contact: "205",
    urgent: true,
    status: "new",
    assignee: "",
    note: "",
    createdAt: NOON_LAO,
    startedAt: null,
    doneAt: null,
    updatedAt: NOON_LAO,
    items: [
      { id: 1, topic: "network", text: "Wi-Fi ຫ້ອງ 203 ຕໍ່ບໍ່ໄດ້", done: false, doneAt: null, doneBy: "" },
      { id: 2, topic: "computer", text: "ເຄື່ອງພິມບໍ່ອອກ", done: false, doneAt: null, doneBy: "" },
      { id: 3, topic: "network", text: "ຊ້າຫຼາຍ", done: false, doneAt: null, doneBy: "" },
    ],
    files: [
      { id: 1, name: "a.jpg", mime: "image/jpeg", size: 1000, kind: "image" },
      { id: 2, name: "b.mp4", mime: "video/mp4", size: 1000, kind: "video" },
    ],
  };
  test("มีเลขตั๋ว ด่วน ผู้แจ้ง/แผนก(ลาว)/เบอร์ เวลาลาว ข้อจัดกลุ่มตามหัวข้อเรียงเลขต่อเนื่อง จำนวนไฟล์ และลิงก์", () => {
    const text = formatReportNotice(report, "http://10.0.100.54:3400/admin/reports?r=12");
    expect(text).toContain("*ມີການແຈ້ງບັນຫາໃໝ່* · Ticket19-10-2026-003");
    expect(text).toContain("🔴 *ດ່ວນ*");
    expect(text).toContain("👤 ສົມຊາຍ ວົງສາ · ຕ້ອນຮັບ · ☎ 205");
    expect(text).toContain("🕒 20-10-2026 12:00");
    expect(text).toMatch(/📌 Wi-Fi \/ ອິນເຕີເນັດ\n {2}1\. Wi-Fi ຫ້ອງ 203 ຕໍ່ບໍ່ໄດ້\n {2}2\. ຊ້າຫຼາຍ\n📌 ຄອມພິວເຕີ \/ ເຄື່ອງພິມ\n {2}3\. ເຄື່ອງພິມບໍ່ອອກ/);
    expect(text).toContain("📎 ໄຟລ໌ແນບ 2 ໄຟລ໌");
    expect(text.endsWith("🔗 http://10.0.100.54:3400/admin/reports?r=12")).toBe(true);
  });
  test("ไม่ด่วน ไม่มีเบอร์ ไม่มีไฟล์ → ไม่มีบรรทัดเหล่านั้น; แผนกที่ไม่รู้จักแสดงรหัสเดิม", () => {
    const text = formatReportNotice({ ...report, urgent: false, contact: "", files: [], department: "zzz" }, "http://x");
    expect(text).not.toContain("ດ່ວນ");
    expect(text).not.toContain("☎");
    expect(text).not.toContain("📎");
    expect(text).toContain("👤 ສົມຊາຍ ວົງສາ · zzz");
  });
  test("ข้อเยอะมาก → ตัดข้อท้าย ๆ ใส่ … แต่คงลิงก์ และยาวไม่เกินขีดจำกัดของ Twilio", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i, topic: "other", text: `ບັນຫາທີ່ ${i + 1} ` + "ລາຍລະອຽດ".repeat(8), done: false, doneAt: null, doneBy: "" }));
    const text = formatReportNotice({ ...report, items }, "http://link/last");
    expect(text.length).toBeLessThanOrEqual(WHATSAPP_BODY_MAX);
    expect(text).toContain("\n  …\n");
    expect(text.endsWith("🔗 http://link/last")).toBe(true);
    expect(text).toContain("1. ບັນຫາທີ່ 1");
    expect(text).not.toContain("50. ບັນຫາທີ່ 50");
  });
  test("ข้อความทดสอบมีวันที่/เวลาลาว", () => {
    expect(formatTestNotice(NOON_LAO)).toContain("20-10-2026 12:00");
    expect(formatTestNotice(NOON_LAO)).toContain("Helpdesk Support");
  });
});
