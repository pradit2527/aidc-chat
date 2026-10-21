// แจ้งเตือนเข้ากลุ่ม WhatsApp: สวิตช์ฟีเจอร์, jid ของกลุ่ม, ชื่อกลุ่มอัตโนมัติ, อุปกรณ์ที่ยังไม่เชื่อมต่อ, ข้อความแจ้งงาน — ไม่แตะ WhatsApp/ฐานข้อมูลจริง
import { chatEnabled, flagOn } from "@/lib/features";
import type { ReportDTO } from "@/lib/reports";
import { deviceEnabled, waDevice } from "@/lib/waDevice";
import { groupName, isGroupJid, resolveGroupTarget, sendToGroup } from "@/lib/whatsapp";
import { formatReportNotice, formatTestNotice, WHATSAPP_BODY_MAX } from "@/lib/whatsappNotice";

const ENV = ["CHAT_ENABLED", "WHATSAPP_DEVICE", "WHATSAPP_GROUP_NAME"];
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

describe("isGroupJid / groupName", () => {
  test("jid ของกลุ่ม WhatsApp = ตัวเลข(-ตัวเลข)?@g.us", () => {
    expect(isGroupJid("120363012345678901@g.us")).toBe(true);
    expect(isGroupJid("8562012345678-1600000000@g.us")).toBe(true);
    expect(isGroupJid("8562012345678@s.whatsapp.net")).toBe(false);
    expect(isGroupJid("nope")).toBe(false);
    expect(isGroupJid(null)).toBe(false);
  });
  test("ชื่อกลุ่มที่เลือกให้เอง = 'IT support cosi' (ผู้ใช้กำหนด) เปลี่ยนได้ด้วย WHATSAPP_GROUP_NAME", () => {
    delete process.env.WHATSAPP_GROUP_NAME;
    expect(groupName()).toBe("IT support cosi");
    process.env.WHATSAPP_GROUP_NAME = "  IT Team  ";
    expect(groupName()).toBe("IT Team");
  });
});

describe("อุปกรณ์ที่เชื่อมต่อ (ไม่แตะ WhatsApp จริง)", () => {
  test("WHATSAPP_DEVICE ไม่ตั้ง → ปิด สถานะ off, ส่งเข้ากลุ่ม = not_configured, ไม่หากลุ่มให้", async () => {
    delete process.env.WHATSAPP_DEVICE;
    expect(deviceEnabled()).toBe(false);
    expect(waDevice().getState()).toMatchObject({ enabled: false, status: "off", qr: null, me: null, queued: 0 });
    expect(await sendToGroup({ jid: "1@g.us", name: "IT" }, "x")).toEqual({ to: "IT", ok: false, status: "not_configured", message: "WHATSAPP_DEVICE is off" });
    expect(await resolveGroupTarget()).toBeNull();
  });
  test("เปิดแต่ยังไม่สแกน → not_linked (ไม่ค้างในคิว) และยังไม่มีกลุ่ม", async () => {
    process.env.WHATSAPP_DEVICE = "1";
    expect(waDevice().getState()).toMatchObject({ enabled: true, status: "idle" });
    const r = await sendToGroup({ jid: "1@g.us", name: "" }, "x");
    expect(r).toMatchObject({ to: "1@g.us", ok: false, status: "not_linked" });
    expect(waDevice().getState().queued).toBe(0);
    expect(await resolveGroupTarget()).toBeNull(); // ไม่มีฐานข้อมูลใน unit test และยังไม่เชื่อมต่อ
  });
});

describe("formatReportNotice / formatTestNotice", () => {
  const NOON_LAO = Date.UTC(2026, 9, 20, 5) / 1000; // 2026-10-20 05:00 UTC = 12:00 เวลาลาว (UTC+7)
  const report: ReportDTO = {
    id: 12,
    ticketNo: "cosi-19-10-2026-003",
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
  test("ขึ้นต้น 'ท่าน <ชื่อ> (แผนก) ได้แจ้งปัญหาในระบบ Ticket แล้ว' + เลขตั๋ว ด่วน เวลาลาว เบอร์ ข้อจัดกลุ่มตามหัวข้อเรียงเลขต่อเนื่อง จำนวนไฟล์ ลิงก์", () => {
    const text = formatReportNotice(report, "http://10.0.100.54:3400/admin/reports?r=12");
    expect(text.startsWith("🎫 *cosi-19-10-2026-003* · 🔴 *ດ່ວນ*\n🆕 ທ່ານ *ສົມຊາຍ ວົງສາ* (ຕ້ອນຮັບ) ໄດ້ແຈ້ງບັນຫາໃນລະບົບ Ticket ແລ້ວ\n")).toBe(true);
    expect(text).toContain("📌 ຫົວຂໍ້: Wi-Fi / ອິນເຕີເນັດ, ຄອມພິວເຕີ / ເຄື່ອງພິມ"); // หัวข้อที่แจ้ง (ผู้ใช้สั่ง)
    expect(text).toContain("🕒 20-10-2026 12:00 · ☎ 205");
    expect(text).toMatch(/▪️ Wi-Fi \/ ອິນເຕີເນັດ\n {2}1\. Wi-Fi ຫ້ອງ 203 ຕໍ່ບໍ່ໄດ້\n {2}2\. ຊ້າຫຼາຍ\n▪️ ຄອມພິວເຕີ \/ ເຄື່ອງພິມ\n {2}3\. ເຄື່ອງພິມບໍ່ອອກ/);
    expect(text).toContain("📎 ໄຟລ໌ແນບ 2 ໄຟລ໌");
    expect(text.endsWith("🔗 http://10.0.100.54:3400/admin/reports?r=12")).toBe(true);
  });
  test("ไม่ด่วน ไม่มีเบอร์ ไม่มีไฟล์ → ไม่มีบรรทัดเหล่านั้น; แผนกที่ไม่รู้จักแสดงรหัสเดิม", () => {
    const text = formatReportNotice({ ...report, urgent: false, contact: "", files: [], department: "zzz" }, "http://x");
    expect(text).not.toContain("ດ່ວນ");
    expect(text).not.toContain("☎");
    expect(text).not.toContain("📎");
    expect(text).toContain("ທ່ານ *ສົມຊາຍ ວົງສາ* (zzz) ໄດ້ແຈ້ງບັນຫາ");
  });
  test("ข้อเยอะมาก → ตัดข้อท้าย ๆ ใส่ … แต่คงลิงก์ และยาวไม่เกินขีดจำกัด", () => {
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
    expect(formatTestNotice(NOON_LAO)).toContain("Ticket Support");
  });
});
