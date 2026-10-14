// งานแจ้งปัญหาแบบรายการ: ตรวจ input ของพนักงาน และคำสั่งของไอที (ตรรกะล้วน ไม่แตะฐานข้อมูล)
import { parseReportAction, parseReportInput, publicView, REPORT_LIMITS, type ReportDTO } from "@/lib/reports";

const good = {
  name: "  Pradit   R ",
  department: "front-office",
  contact: " 101 ",
  identifier: "cosi_" + "a".repeat(24),
  urgent: true,
  topics: [
    { topic: "network", items: ["  Wi-Fi ຊັ້ນ 3  ຊ້າ ", "", "   "] },
    { topic: "cosi-computer", items: ["ເຄື່ອງພິມ 203 ພິມບໍ່ອອກ", "ຄອມຫ້ອງ 105 ເປີດບໍ່ຕິດ"] },
  ],
};

describe("parseReportInput", () => {
  test("ข้อมูลถูกต้อง → ทำความสะอาด ตัดช่องว่าง ตัดข้อว่าง รับทั้ง id และ cosi-<id>", () => {
    const r = parseReportInput(good);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toEqual({
      name: "Pradit R",
      department: "front-office",
      contact: "101",
      identifier: good.identifier,
      urgent: true,
      topics: [
        { topic: "network", items: ["Wi-Fi ຊັ້ນ 3 ຊ້າ"] },
        { topic: "computer", items: ["ເຄື່ອງພິມ 203 ພິມບໍ່ອອກ", "ຄອມຫ້ອງ 105 ເປີດບໍ່ຕິດ"] },
      ],
      files: [],
    });
  });

  test.each([
    ["ไม่ใช่ object", null, "bad_request"],
    ["ไม่มีชื่อ", { ...good, name: "  " }, "name_required"],
    ["แผนกไม่ถูกต้อง", { ...good, department: "spa" }, "department_required"],
    ["ไม่มี topics", { ...good, topics: undefined }, "topics_required"],
    ["หัวข้อไม่รู้จัก", { ...good, topics: [{ topic: "printer", items: ["x"] }] }, "topic_invalid"],
    ["ไม่มีข้อเลย", { ...good, topics: [{ topic: "network", items: ["", "  "] }] }, "items_required"],
    ["ข้อต่อหัวข้อเกิน 20", { ...good, topics: [{ topic: "network", items: Array(21).fill("x") }] }, "too_many_items"],
    [
      "ข้อรวมเกิน 50",
      { ...good, topics: ["network", "computer", "pms"].map((t) => ({ topic: t, items: Array(20).fill("x") })) },
      "too_many_items",
    ],
  ])("%s → %s", (_label, body, error) => {
    expect(parseReportInput(body)).toEqual({ ok: false, error });
  });

  test("identifier ผิดรูปแบบ → เก็บเป็นค่าว่าง (ไม่ปฏิเสธ), urgent ที่ไม่ใช่ true → false", () => {
    const r = parseReportInput({ ...good, identifier: "hacker", urgent: "yes" });
    expect(r.ok && r.value.identifier).toBe("");
    expect(r.ok && r.value.urgent).toBe(false);
  });

  test("หัวข้อซ้ำ → ใช้ครั้งแรก; หัวข้อที่ไม่มีข้อ → ถูกตัดออก", () => {
    const r = parseReportInput({
      ...good,
      topics: [
        { topic: "network", items: ["a"] },
        { topic: "network", items: ["b"] },
        { topic: "pms", items: [] },
      ],
    });
    expect(r.ok && r.value.topics).toEqual([{ topic: "network", items: ["a"] }]);
  });

  test("ข้อความยาวเกิน 300 ตัวอักษร → ตัดที่ 300; ชื่อเกิน 80 → ตัดที่ 80", () => {
    const r = parseReportInput({ ...good, name: "ก".repeat(100), topics: [{ topic: "other", items: ["x".repeat(500)] }] });
    expect(r.ok && r.value.name).toHaveLength(80);
    expect(r.ok && r.value.topics[0].items[0]).toHaveLength(REPORT_LIMITS.itemLength);
  });
});

describe("parseReportAction", () => {
  test.each([
    [{ action: "start" }, { action: "start" }],
    [{ action: "done" }, { action: "done" }],
    [{ action: "reopen" }, { action: "reopen" }],
    [{ action: "assign", assignee: "  Decha  " }, { action: "assign", assignee: "Decha" }],
    [{ action: "note", note: "  ซ่อมแล้ว  " }, { action: "note", note: "ซ่อมแล้ว" }],
    [{ action: "item", itemId: 5, done: true }, { action: "item", itemId: 5, done: true }],
  ])("%p → %p", (input, expected) => {
    expect(parseReportAction(input)).toEqual(expected);
  });

  test.each([
    [null],
    [{ action: "delete" }],
    [{ action: "assign" }],
    [{ action: "note", note: 5 }],
    [{ action: "item", itemId: "5", done: true }],
    [{ action: "item", itemId: 5, done: "yes" }],
    [{ action: "item", itemId: 1.5, done: true }],
  ])("ไม่ถูกต้อง %p → null", (input) => {
    expect(parseReportAction(input)).toBeNull();
  });
});

describe("publicView", () => {
  test("ตัดบันทึกภายในของไอทีออกก่อนส่งให้พนักงาน", () => {
    const r: ReportDTO = {
      id: 1, ticketNo: "T", name: "A", department: "other", contact: "", urgent: false, status: "new", assignee: "",
      note: "ความลับภายใน", createdAt: 1, startedAt: null, doneAt: null, updatedAt: 1, items: [],
    };
    const v = publicView(r);
    expect("note" in v).toBe(false);
    expect(v.ticketNo).toBe("T");
    expect(r.note).toBe("ความลับภายใน"); // ไม่แก้ต้นฉบับ
  });
});
