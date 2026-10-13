// เลขตั๋ว: วันที่ตามเวลาลาว (UTC+7), เลขรันต่อวัน, การจัดลำดับ
import { assignTickets, dayStart, formatTicket, laoTime, ticketDate } from "@/lib/tickets";

const T = (iso: string) => Math.floor(Date.parse(iso) / 1000);

describe("ticketDate — วันที่ตามเวลาลาว", () => {
  test("16:59:59Z ยังเป็นวันเดิม (23:59:59 เวลาลาว)", () => {
    expect(ticketDate(T("2026-10-12T16:59:59Z"))).toBe("12-10-2026");
  });
  test("17:00:00Z ขึ้นวันใหม่ (00:00 เวลาลาว)", () => {
    expect(ticketDate(T("2026-10-12T17:00:00Z"))).toBe("13-10-2026");
  });
  test("ข้ามปี 31 ธ.ค. 17:00Z → 1 ม.ค. ปีถัดไป", () => {
    expect(ticketDate(T("2026-12-31T17:00:00Z"))).toBe("01-01-2027");
  });
  test("เติมศูนย์หน้าวันและเดือน", () => {
    expect(ticketDate(T("2026-03-05T03:00:00Z"))).toBe("05-03-2026");
  });
});

describe("dayStart — เวลาเริ่มวันลาวเป็นวินาที UTC", () => {
  test("กลางวันลาว → 17:00Z ของวันก่อนหน้า", () => {
    expect(dayStart(T("2026-10-13T05:30:00Z"))).toBe(T("2026-10-12T17:00:00Z"));
  });
  test("หนึ่งวินาทีก่อนเที่ยงคืนลาว ยังอยู่วันเดิม", () => {
    expect(dayStart(T("2026-10-12T16:59:59Z"))).toBe(T("2026-10-11T17:00:00Z"));
  });
  test("เรียกซ้ำกับผลลัพธ์เดิมได้ค่าเดิม (idempotent)", () => {
    const d = dayStart(T("2026-10-13T05:30:00Z"));
    expect(dayStart(d)).toBe(d);
  });
});

describe("laoTime — ชั่วโมง:นาที เวลาลาว", () => {
  test("02:05Z → 09:05", () => expect(laoTime(T("2026-10-13T02:05:00Z"))).toBe("09:05"));
  test("17:30Z → 00:30 (วันถัดไป)", () => expect(laoTime(T("2026-10-13T17:30:00Z"))).toBe("00:30"));
});

describe("formatTicket — รูปแบบ Ticket<dd-mm-yyyy>-<nnn>", () => {
  test.each([
    [1, "Ticket13-10-2026-001"],
    [12, "Ticket13-10-2026-012"],
    [123, "Ticket13-10-2026-123"],
    [1000, "Ticket13-10-2026-1000"],
  ])("ลำดับ %i → %s", (seq, expected) => {
    expect(formatTicket("13-10-2026", seq)).toBe(expected);
  });
});

describe("assignTickets — แบบคำนวณ (fallback เมื่อไม่มีฐานข้อมูล)", () => {
  const today = T("2026-10-13T01:00:00Z"); // 08:00 เวลาลาว
  const yesterday = T("2026-10-12T01:00:00Z");

  test("นับ 001, 002… ใหม่ทุกวัน เรียงตามเลขเคส (id) ภายในวัน", () => {
    const map = assignTickets([
      { id: 20, createdAt: today + 7200 },
      { id: 15, createdAt: today },
      { id: 18, createdAt: today + 3600 },
      { id: 9, createdAt: yesterday },
    ]);
    expect(map.get(15)).toBe("Ticket13-10-2026-001");
    expect(map.get(18)).toBe("Ticket13-10-2026-002");
    expect(map.get(20)).toBe("Ticket13-10-2026-003");
    expect(map.get(9)).toBe("Ticket12-10-2026-001");
  });

  test("เรียงตาม id ไม่ใช่เวลาสร้าง (พฤติกรรมที่เอกสารระบุ)", () => {
    const map = assignTickets([
      { id: 31, createdAt: today + 10 },
      { id: 30, createdAt: today + 20 },
    ]);
    expect(map.get(30)).toBe("Ticket13-10-2026-001");
    expect(map.get(31)).toBe("Ticket13-10-2026-002");
  });

  test("รายการว่าง → map ว่าง", () => {
    expect(assignTickets([]).size).toBe(0);
  });

  test("ไม่แก้ไข array ต้นฉบับ", () => {
    const rows = [
      { id: 2, createdAt: today },
      { id: 1, createdAt: today },
    ];
    assignTickets(rows);
    expect(rows.map((r) => r.id)).toEqual([2, 1]);
  });
});
