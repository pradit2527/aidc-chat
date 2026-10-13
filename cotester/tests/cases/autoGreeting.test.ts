// กฎคำทักทายอัตโนมัติ "ทุกครั้งที่มีแชทใหม่" (รวมคนเก่าที่พิมพ์มาใหม่)
import {
  AUTO_GREETING_ENABLED,
  AUTO_GREETING_TEXT,
  chatStartOf,
  GREETED_ATTR,
  IDLE_SEC,
  shouldGreet,
  type MsgLite,
} from "@/lib/autoGreeting";

const IDLE = 3600;
const inc = (createdAt: number, text = "ສະບາຍດີ"): MsgLite => ({ createdAt, kind: "incoming", privateNote: false, text });
const out = (createdAt: number, text = "ຕອບ"): MsgLite => ({ createdAt, kind: "outgoing", privateNote: false, text });
const note = (createdAt: number): MsgLite => ({ createdAt, kind: "outgoing", privateNote: true, text: "บันทึกภายใน" });
const act = (createdAt: number, text: string): MsgLite => ({ createdAt, kind: "activity", privateNote: false, text });

describe("ค่าตั้งต้น", () => {
  test("เปิดใช้งาน และข้อความเป็นภาษาลาวตามที่ผู้ใช้กำหนด", () => {
    expect(AUTO_GREETING_ENABLED).toBe(true);
    expect(AUTO_GREETING_TEXT).toBe("ສະບາຍດີ ພະແນກໄອທີຍິນດີໃຫ້ບໍລິການ ກະລຸນາບອກພວກເຮົາກ່ຽວກັບບັນຫາຂອງທ່ານ");
  });
  test("custom attribute และช่วงเงียบเริ่มต้น 60 นาที", () => {
    expect(GREETED_ATTR).toBe("auto_greeted_at");
    expect(IDLE_SEC).toBe(3600);
  });
});

describe("chatStartOf — จุดเริ่มแชทใหม่", () => {
  test("(ก) ยังไม่เคยมีข้อความขาออก → ข้อความแรกของลูกค้าคือจุดเริ่ม", () => {
    expect(chatStartOf([inc(100), inc(200)], IDLE)).toBe(100);
  });
  test("คุยต่อเนื่องภายในช่วงเงียบ → ไม่ใช่แชทใหม่", () => {
    expect(chatStartOf([inc(100), out(1000), inc(1500)], IDLE)).toBeNull();
  });
  test("(ค) เงียบครบ IDLE แล้วพิมพ์มาใหม่ → แชทใหม่ (ขอบเขต >=)", () => {
    expect(chatStartOf([out(1000), inc(1000 + IDLE)], IDLE)).toBe(1000 + IDLE);
    expect(chatStartOf([out(1000), inc(1000 + IDLE - 1)], IDLE)).toBeNull();
  });
  test("(ข) เคสถูกปิด (activity resolved) แล้วลูกค้าพิมพ์มาอีก → แชทใหม่แม้ยังไม่ถึง IDLE", () => {
    expect(chatStartOf([out(1000), act(1200, "Conversation was resolved by Pradit"), inc(1300)], IDLE)).toBe(1300);
  });
  test("activity resolved ที่เกิดก่อนข้อความขาออกล่าสุด ไม่นับ", () => {
    expect(chatStartOf([act(100, "resolved"), out(200), inc(300)], IDLE)).toBeNull();
  });
  test("ตัวพิมพ์ใหญ่/เล็กของคำว่า resolved ไม่มีผล", () => {
    expect(chatStartOf([out(1000), act(1100, "RESOLVED"), inc(1200)], IDLE)).toBe(1200);
  });
  test("บันทึกภายใน (private note) ไม่นับเป็นข้อความขาออก", () => {
    // note เป็นข้อความขาออกเดียว → เหมือนยังไม่เคยตอบ
    expect(chatStartOf([note(50), inc(100)], IDLE)).toBe(100);
    // note หลังตอบจริง ไม่รีเซ็ตเวลาเงียบ
    expect(chatStartOf([inc(100), out(200), note(5000), inc(200 + IDLE)], IDLE)).toBe(200 + IDLE);
  });
  test("ลูกค้าพิมพ์หลายข้อความติดกัน → ใช้ข้อความแรกเป็นจุดเริ่ม", () => {
    expect(chatStartOf([out(1000), inc(1000 + IDLE), inc(1000 + IDLE + 5), inc(1000 + IDLE + 9)], IDLE)).toBe(1000 + IDLE);
  });
  test("ข้อควรระวัง: ข้อความขาออกที่เวลา = 0 ถูกมองว่า 'ยังไม่เคยตอบ' (ค่าเฝ้าระวังภายใน) — Chatwoot ไม่ส่งเวลา 0 จริง", () => {
    expect(chatStartOf([out(0), inc(10)], IDLE)).toBe(10);
  });
  test("ลำดับข้อความที่ส่งเข้ามาไม่เรียง ให้ผลเหมือนกัน", () => {
    const a = chatStartOf([inc(1300), out(1000), act(1200, "resolved")], IDLE);
    const b = chatStartOf([out(1000), act(1200, "resolved"), inc(1300)], IDLE);
    expect(a).toBe(b);
  });
  test("มีแต่ข้อความขาออก หรือรายการว่าง → null", () => {
    expect(chatStartOf([out(1), out(2)], IDLE)).toBeNull();
    expect(chatStartOf([], IDLE)).toBeNull();
  });
  test("กำหนด idleSec เองได้", () => {
    expect(chatStartOf([out(1000), inc(1060)], 60)).toBe(1060);
    expect(chatStartOf([out(1000), inc(1059)], 60)).toBeNull();
  });
});

describe("shouldGreet — ทักเมื่อแชทใหม่เริ่มหลังครั้งล่าสุดที่เคยทัก", () => {
  const START = 1000 + IDLE;
  test("ยังไม่เคยทัก (greetedAt = 0) และมีแชทใหม่ → ทัก", () => {
    expect(shouldGreet([out(1000), inc(START)], 0, IDLE)).toEqual({ greet: true, chatStart: START });
  });
  test("เคยทักหลังจุดเริ่มแชทนี้แล้ว → ไม่ทักซ้ำ", () => {
    expect(shouldGreet([out(1000), inc(START)], START, IDLE).greet).toBe(false);
    expect(shouldGreet([out(1000), inc(START)], START + 10, IDLE).greet).toBe(false);
  });
  test("เคยทักก่อนจุดเริ่มแชทใหม่ → ทักอีกครั้ง (คนเก่ากลับมา)", () => {
    expect(shouldGreet([out(1000), inc(START)], START - 1, IDLE).greet).toBe(true);
  });
  test("ไม่มีแชทใหม่ → ไม่ทัก และ chatStart เป็น null", () => {
    expect(shouldGreet([out(1000), inc(1010)], 0, IDLE)).toEqual({ greet: false, chatStart: null });
  });
});
