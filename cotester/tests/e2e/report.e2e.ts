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


/** PNG 1x1 (67 ไบต์) สำหรับทดสอบอัปโหลด */
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
async function upload(blob: Blob, name: string, who: string, origin = BASE) {
  const body = new FormData();
  body.append("file", blob, name);
  body.append("who", who);
  const res = await fetch(`${BASE}/api/reports/upload`, { method: "POST", body, headers: { origin } });
  return { status: res.status, json: (await res.json().catch(() => null)) as Record<string, unknown> | null };
}

const staff = new Client();
const admin = new Client();
const MOCK_LOGIN = { email: "it.test@example.invalid", password: "mock-only-password" };
const AGENT = "Pradit Ratthanoo";
let identifier = "";
let ticketNo = "";
let reportId = 0;

beforeAll(async () => {
  await q("TRUNCATE report_files, reports, report_items, report_events, tickets, ticket_events, ticket_counters RESTART IDENTITY");
  const id = (await staff.post("/api/identify", { name: "Report Tester", department: "housekeeping", contact: "205" })).json as { identifier: string };
  identifier = id.identifier;
});
afterAll(async () => {
  await q("TRUNCATE report_files, reports, report_items, report_events, tickets, ticket_events, ticket_counters RESTART IDENTITY");
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

describe("ไฟล์แนบ (รูป/วิดีโอ)", () => {
  let fileId = 0;
  let token = "";
  let withFileNo = "";
  let withFileId = 0;

  test("อัปโหลดรูป → 201 + id/token; ชนิดไม่รองรับ → 400; Origin แปลก → 403", async () => {
    const r = await upload(new Blob([PNG_1x1], { type: "image/png" }), "ຮູບ ທົດສອບ.png", identifier);
    expect(r.status).toBe(201);
    expect(r.json).toMatchObject({ name: "ຮູບ ທົດສອບ.png", mime: "image/png", size: PNG_1x1.length, kind: "image" });
    expect(String(r.json!.token)).toMatch(/^[0-9a-f]{32}$/);
    fileId = Number(r.json!.id);
    token = String(r.json!.token);
    expect((await upload(new Blob(["hello"], { type: "text/plain" }), "a.txt", identifier)).json).toEqual({ error: "file_type" });
    expect((await upload(new Blob([PNG_1x1], { type: "image/png" }), "a.png", identifier, "http://evil.test")).status).toBe(403);
  });

  test("ไฟล์ที่ยังไม่ผูกรายงาน: ผู้อัปโหลดดูได้ คนอื่น/ไม่ล็อกอิน → 404", async () => {
    expect((await staff.get(`/api/reports/files/${fileId}?who=${identifier}`)).status).toBe(200);
    expect((await staff.get(`/api/reports/files/${fileId}`)).status).toBe(404);
    expect((await staff.get(`/api/reports/files/${fileId}?who=cosi_${"c".repeat(24)}`)).status).toBe(404);
  });

  test("ส่งรายงานพร้อมไฟล์ → ผูกไฟล์; token ผิดถูกข้าม; files เกิน 5 → 400", async () => {
    const base = { name: "Report Tester", department: "housekeeping", identifier, topics: [{ topic: "cctv", items: ["ກ້ອງໜ້າລິບບໍ່ຕິດ"] }] };
    const r = await staff.post("/api/reports", { ...base, files: [{ id: fileId, token }, { id: fileId, token: "0".repeat(32) }] });
    expect(r.status).toBe(201);
    withFileNo = (r.json as { ticketNo: string }).ticketNo;
    withFileId = (r.json as { id: number }).id;
    const mine = (await staff.get(`/api/reports/${withFileNo}?who=${identifier}`)).json as { report: { files: { id: number; kind: string; name: string }[] } };
    expect(mine.report.files).toEqual([{ id: fileId, name: "ຮູບ ທົດສອບ.png", mime: "image/png", size: PNG_1x1.length, kind: "image" }]);
    const tooMany = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, token: "a".repeat(32) }));
    expect((await staff.post("/api/reports", { ...base, files: tooMany })).json).toEqual({ error: "too_many_files" });
    expect((await staff.post("/api/reports", { ...base, files: [{ id: "x", token: "y" }] })).json).toEqual({ error: "file_invalid" });
  });

  test("ไฟล์ที่ผูกแล้ว: เจ้าของดูได้, ไอทีที่ล็อกอินดูได้ (เนื้อหาตรง + Range 206), ไฟล์ซ้ำผูกรายงานอื่นไม่ได้", async () => {
    const owner = await fetch(`${BASE}/api/reports/files/${fileId}?who=${identifier}`);
    expect(owner.status).toBe(200);
    expect(owner.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(await owner.arrayBuffer()).equals(PNG_1x1)).toBe(true);
    const adminRes = await admin.get(`/api/reports/files/${fileId}`);
    expect(adminRes.status).toBe(200);
    const range = await fetch(`${BASE}/api/reports/files/${fileId}?who=${identifier}`, { headers: { range: "bytes=0-9" } });
    expect(range.status).toBe(206);
    expect(range.headers.get("content-range")).toBe(`bytes 0-9/${PNG_1x1.length}`);
    expect((await range.arrayBuffer()).byteLength).toBe(10);
    const again = await staff.post("/api/reports", { name: "Report Tester", department: "housekeeping", identifier, topics: [{ topic: "other", items: ["x"] }], files: [{ id: fileId, token }] });
    const dup = (await staff.get(`/api/reports/${(again.json as { ticketNo: string }).ticketNo}?who=${identifier}`)).json as { report: { files: unknown[] } };
    expect(dup.report.files).toEqual([]);
    const adminView = (await admin.get(`/api/admin/reports/${withFileId}`)).json as { report: { files: { id: number }[] } };
    expect(adminView.report.files.map((f) => f.id)).toEqual([fileId]);
  });
});

describe("รายงานของฉัน (GET /api/reports/mine) — หน้าละ 30", () => {
  test("เห็นเฉพาะรายงานของ identifier ตัวเอง พร้อมสถานะ/ผู้รับเรื่อง/จำนวนข้อ เรียงล่าสุดก่อน", async () => {
    const r = (await staff.get(`/api/reports/mine?who=${identifier}`)).json as {
      enabled: boolean; total: number; page: number; pages: number; perPage: number;
      reports: { ticketNo: string; status: string; assignee: string; itemsDone: number; itemsTotal: number }[];
    };
    expect(r.enabled).toBe(true);
    expect(r.perPage).toBe(30);
    expect(r.page).toBe(1);
    expect(r.total).toBeGreaterThanOrEqual(3);
    expect(r.reports.length).toBe(r.total);
    // ล่าสุดก่อน: เลขตั๋วเรียงลดลง
    const nos = r.reports.map((x) => x.ticketNo);
    expect([...nos].sort().reverse()).toEqual(nos);
    const first = r.reports.find((x) => x.ticketNo === ticketNo)!;
    expect(first).toMatchObject({ status: "done", assignee: "Decha", itemsDone: 3, itemsTotal: 3 });
    expect((await staff.get(`/api/reports/mine?who=cosi_${"d".repeat(24)}`)).json).toMatchObject({ total: 0, reports: [] });
    expect((await staff.get(`/api/reports/mine?who=hacker`)).json).toMatchObject({ total: 0, reports: [] });
  });
  test("หน้าเกินช่วงถูกบีบให้อยู่ในช่วง", async () => {
    const r = (await staff.get(`/api/reports/mine?who=${identifier}&page=99`)).json as { page: number; pages: number; reports: unknown[] };
    expect(r.page).toBe(r.pages);
    expect(r.reports.length).toBeGreaterThan(0);
  });
});
