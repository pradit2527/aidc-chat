// งานแจ้งปัญหาแบบรายการ ครบวงจร: พนักงานส่ง → ดูสถานะ → ไอทีรับงาน/ติ๊กข้อ/ปิดงาน → เลขตั๋วใช้ชุดเดียวกับเคสแชท
import { neon } from "@neondatabase/serverless";
import { BASE, Client } from "./client";

const DB = process.env.E2E_DATABASE_URL ?? "";
if (!DB) throw new Error("ต้องตั้ง E2E_DATABASE_URL (รันผ่าน npm run test:e2e)");
if (/\/neondb(\?|$)/.test(DB)) throw new Error("ไม่ยอมรันกับฐานข้อมูลจริง (neondb)");
const sql = neon(DB);
const q = (text: string, params: unknown[] = []) => sql.query(text, params) as Promise<Record<string, unknown>[]>;

type Item = { id: number; topic: string; text: string; done: boolean; doneBy: string };
type Report = { id: number; ticketNo: string; name: string; status: string; assignee: string; note?: string; urgent: boolean; items: Item[]; doneAt: number | null };

const staff = new Client();
const admin = new Client();
const MOCK_LOGIN = { email: "it.test@example.invalid", password: "mock-only-password" };
const AGENT = "Pradit Ratthanoo";
let identifier = "";
let ticketNo = "";
let reportId = 0;

beforeAll(async () => {
  await q("TRUNCATE reports, report_items, report_events, tickets, ticket_events, ticket_counters RESTART IDENTITY");
  const id = (await staff.post("/api/identify", { name: "Report Tester", department: "housekeeping", contact: "205" })).json as { identifier: string };
  identifier = id.identifier;
});
afterAll(async () => {
  await q("TRUNCATE reports, report_items, report_events, tickets, ticket_events, ticket_counters RESTART IDENTITY");
});

describe("หน้าพนักงาน", () => {
  test("/start = หน้าหลักเลือกบริการ (แชท / แจ้งปัญหา) และ QR ที่ / ชี้ไป /start", async () => {
    const r = await staff.get("/start");
    expect(r.status).toBe(200);
    expect(r.text).toContain("ເລືອກບໍລິການ");
    expect(r.text).toContain('href="/chat"');
    expect(r.text).toContain('href="/report"');
    expect((await staff.get("/")).text).toMatch(/https?:\/\/[^"<]+\/start/); // บน localhost โปสเตอร์ใช้ IP ของเครื่องแทน
  });
  test("/report แสดงฟอร์มแจ้งปัญหา (หัวข้อ 7 รายการ)", async () => {
    const r = await staff.get("/report");
    expect(r.status).toBe(200);
    expect(r.text).toContain("ແຈ້ງບັນຫາ");
    expect(r.text).toContain("Wi-Fi / ອິນເຕີເນັດ");
    expect(r.text).not.toContain("ຍັງບໍ່ເປີດໃຊ້"); // มีฐานข้อมูล
  });
  test("/chat มีปุ่มกลับหน้าหลัก", async () => {
    expect((await staff.get("/chat")).text).toContain('href="/start"');
  });
});

describe("ส่งรายงาน (POST /api/reports)", () => {
  test("ตรวจ input: ไม่มีข้อ → 400 items_required, หัวข้อผิด → 400, Origin แปลก → 403", async () => {
    const base = { name: "Report Tester", department: "housekeeping", contact: "205", identifier, urgent: false };
    expect((await staff.post("/api/reports", { ...base, topics: [{ topic: "network", items: [] }] })).json).toEqual({ error: "items_required" });
    expect((await staff.post("/api/reports", { ...base, topics: [{ topic: "nope", items: ["x"] }] })).status).toBe(400);
    expect((await staff.post("/api/reports", { ...base, topics: [{ topic: "network", items: ["x"] }] }, { origin: "http://evil.test" })).status).toBe(403);
  });

  test("ส่งสำเร็จ → 201 + เลขตั๋วรูปแบบเดียวกับเคสแชท และเก็บข้อครบตามลำดับ", async () => {
    const r = await staff.post("/api/reports", {
      name: "Report Tester",
      department: "housekeeping",
      contact: "205",
      identifier,
      urgent: true,
      topics: [
        { topic: "computer", items: ["ເຄື່ອງພິມ 203 ພິມບໍ່ອອກ", "ຄອມຫ້ອງ 105 ເປີດບໍ່ຕິດ"] },
        { topic: "network", items: ["Wi-Fi ຊັ້ນ 3 ຊ້າ"] },
      ],
    });
    expect(r.status).toBe(201);
    const j = r.json as { id: number; ticketNo: string };
    expect(j.ticketNo).toMatch(/^Ticket\d{2}-\d{2}-\d{4}-001$/);
    ticketNo = j.ticketNo;
    reportId = j.id;
    const items = await q("SELECT topic, text, position FROM report_items WHERE report_id = $1 ORDER BY position", [reportId]);
    expect(items.map((i) => [i.topic, i.text])).toEqual([
      ["computer", "ເຄື່ອງພິມ 203 ພິມບໍ່ອອກ"],
      ["computer", "ຄອມຫ້ອງ 105 ເປີດບໍ່ຕິດ"],
      ["network", "Wi-Fi ຊັ້ນ 3 ຊ້າ"],
    ]);
  });

  test("เลขตั๋วเป็นชุดเดียวกับเคสแชท: รายงานถัดไปได้ 002 และตัวนับวันถูกแชร์", async () => {
    const r = await staff.post("/api/reports", { name: "Report Tester", department: "housekeeping", identifier, topics: [{ topic: "other", items: ["ອື່ນໆ"] }] });
    expect((r.json as { ticketNo: string }).ticketNo.endsWith("-002")).toBe(true);
    const [c] = await q("SELECT seq FROM ticket_counters");
    expect(Number(c.seq)).toBe(2);
  });
});

describe("พนักงานดูสถานะ (GET /api/reports/:no?who=)", () => {
  test("เจ้าของดูได้ (ไม่มีบันทึกภายใน); identifier อื่น/ไม่มี → 404", async () => {
    const ok = await staff.get(`/api/reports/${ticketNo}?who=${identifier}`);
    expect(ok.status).toBe(200);
    const rep = (ok.json as { report: Report }).report;
    expect(rep).toMatchObject({ ticketNo, status: "new", urgent: true, assignee: "" });
    expect(rep.items).toHaveLength(3);
    expect("note" in rep).toBe(false);
    expect((await staff.get(`/api/reports/${ticketNo}?who=cosi_${"b".repeat(24)}`)).status).toBe(404);
    expect((await staff.get(`/api/reports/${ticketNo}`)).status).toBe(404);
  });
  test("หน้า /report/<เลข> เปิดได้", async () => {
    expect((await staff.get(`/report/${ticketNo}`)).status).toBe(200);
  });
});

describe("คอนโซลไอที (/admin/reports)", () => {
  test("ยังไม่ล็อกอิน → API 401 และหน้าเด้งไป /admin", async () => {
    expect((await admin.get("/api/admin/reports")).status).toBe(401);
    const r = await admin.get("/admin/reports");
    expect([301, 302, 307, 308]).toContain(r.status);
    expect(["/admin", `${BASE}/admin`]).toContain(r.redirect);
  });

  test("ล็อกอินแล้วเห็นงานใหม่ 2 รายการ (ด่วนก่อน) + summary; หน้า /admin/reports เปิดได้", async () => {
    expect((await admin.post("/api/admin/login", MOCK_LOGIN)).status).toBe(200);
    const r = (await admin.get("/api/admin/reports?status=new")).json as { enabled: boolean; summary: Record<string, number>; reports: Report[] };
    expect(r.enabled).toBe(true);
    expect(r.summary).toEqual({ new: 2, inProgress: 0, done: 0 });
    expect(r.reports.map((x) => x.ticketNo)).toEqual([ticketNo, `${ticketNo.slice(0, -3)}002`]); // ด่วนก่อน
    expect((await admin.get("/admin/reports")).status).toBe(200);
    expect((await admin.get("/api/admin/reports?summary=1")).json).toEqual({ enabled: true, summary: { new: 2, inProgress: 0, done: 0 } });
  });

  test("รับงาน → in_progress + ผู้รับผิดชอบ = ผู้กด; พนักงานเห็นสถานะเปลี่ยน", async () => {
    const r = (await admin.post(`/api/admin/reports/${reportId}`, { action: "start" })).json as { report: Report };
    expect(r.report).toMatchObject({ status: "in_progress", assignee: AGENT });
    const mine = (await staff.get(`/api/reports/${ticketNo}?who=${identifier}`)).json as { report: Report };
    expect(mine.report.status).toBe("in_progress");
    expect(mine.report.assignee).toBe(AGENT);
  });

  test("ติ๊กข้อทีละข้อ → บันทึกผู้ทำ; ติ๊กครบทุกข้อ → ปิดงานอัตโนมัติ", async () => {
    const items = ((await admin.get(`/api/admin/reports/${reportId}`)).json as { report: Report }).report.items;
    let rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "item", itemId: items[0].id, done: true })).json as { report: Report }).report;
    expect(rep.status).toBe("in_progress");
    expect(rep.items[0]).toMatchObject({ done: true, doneBy: AGENT });
    rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "item", itemId: items[1].id, done: true })).json as { report: Report }).report;
    rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "item", itemId: items[2].id, done: true })).json as { report: Report }).report;
    expect(rep.status).toBe("done");
    expect(rep.doneAt).not.toBeNull();
    expect(rep.items.every((i) => i.done)).toBe(true);
    const ev = (await q("SELECT type FROM report_events WHERE report_id = $1 ORDER BY id", [reportId])).map((e) => e.type);
    expect(ev).toEqual(["created", "started", "item_done", "item_done", "item_done", "done"]);
  });

  test("ยกเลิกติ๊ก 1 ข้อหลังปิดงาน → กลับเป็น in_progress; ปิดวียกด้วยปุ่ม → ข้อที่เหลือถูกติ๊กให้", async () => {
    const items = ((await admin.get(`/api/admin/reports/${reportId}`)).json as { report: Report }).report.items;
    let rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "item", itemId: items[2].id, done: false })).json as { report: Report }).report;
    expect(rep.status).toBe("in_progress");
    expect(rep.items[2].done).toBe(false);
    rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "done" })).json as { report: Report }).report;
    expect(rep.status).toBe("done");
    expect(rep.items.every((i) => i.done)).toBe(true);
  });

  test("มอบหมาย, บันทึกภายใน (พนักงานไม่เห็น), เปิดใหม่, และ validation", async () => {
    let rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "assign", assignee: "Decha" })).json as { report: Report }).report;
    expect(rep.assignee).toBe("Decha");
    rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "note", note: "เปลี่ยนหมึกแล้ว" })).json as { report: Report }).report;
    expect(rep.note).toBe("เปลี่ยนหมึกแล้ว");
    const mine = (await staff.get(`/api/reports/${ticketNo}?who=${identifier}`)).json as { report: Report };
    expect("note" in mine.report).toBe(false);
    rep = ((await admin.post(`/api/admin/reports/${reportId}`, { action: "reopen" })).json as { report: Report }).report;
    expect(rep.status).toBe("in_progress");
    expect(rep.doneAt).toBeNull();
    expect((await admin.post(`/api/admin/reports/${reportId}`, { action: "explode" })).status).toBe(400);
    expect((await admin.post(`/api/admin/reports/999999`, { action: "start" })).status).toBe(404);
    expect((await admin.post(`/api/admin/reports/${reportId}`, { action: "start" }, { origin: "http://evil.test" })).status).toBe(403);
  });

  test("แท็บ done / all และ summary สอดคล้องกัน", async () => {
    await admin.post(`/api/admin/reports/${reportId}`, { action: "done" });
    const done = (await admin.get("/api/admin/reports?status=done")).json as { reports: Report[]; summary: Record<string, number> };
    expect(done.reports.map((r) => r.id)).toEqual([reportId]);
    expect(done.summary).toEqual({ new: 1, inProgress: 0, done: 1 });
    const all = (await admin.get("/api/admin/reports?status=all")).json as { reports: Report[] };
    expect(all.reports).toHaveLength(2);
  });
});
