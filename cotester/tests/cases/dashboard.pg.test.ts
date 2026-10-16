// แดชบอร์ดหัวหน้า — ทดสอบ SQL กับ Postgres จริง (ข้ามอัตโนมัติถ้าไม่ตั้ง TEST_PG_URL; ต้องมี `npm i --no-save pg` และฐานที่รัน db/schema.sql แล้ว)
// ตัวอย่าง: TEST_PG_URL=postgres://tester@localhost:54329/aidctest npm test -- dashboard.pg
const URL = process.env.TEST_PG_URL;
const maybe = URL ? describe : describe.skip;

jest.mock("@/lib/db", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.TEST_PG_URL });
  return { dbEnabled: true, db: () => pool, q: async (text: string, params: unknown[] = []) => (await pool.query(text, params)).rows };
});

import { db } from "@/lib/db";
import { getCaseDetail } from "@/lib/caseDetail";
import { getDashboard, parseDashboardQuery } from "@/lib/dashboard";

const sql = (text: string, p: unknown[] = []) => db().query(text, p);
const all = () => parseDashboardQuery(new URLSearchParams());

maybe("getDashboard (Postgres จริง)", () => {
  beforeAll(async () => {
    await sql("TRUNCATE tickets, reports, report_items, report_events, ticket_counters, ticket_events RESTART IDENTITY CASCADE");
    const t = (id: number, no: string, name: string, dept: string, status: string, assignee: string, urgent: boolean, firstReply: boolean) =>
      sql(
        `INSERT INTO tickets (conversation_id, ticket_no, ticket_day, seq, contact_name, department, labels, urgent, status, assignee_name,
                              created_at, first_reply_at, resolved_at, last_activity_at)
         VALUES ($1::bigint,$2,'01-01-2026',$1::int,$3,$4,ARRAY['cosi-network'],$5,$6,$7, now() - interval '2 hours',
                 CASE WHEN $8::boolean THEN now() - interval '110 minutes' END, CASE WHEN $6::text='resolved' THEN now() - interval '1 hour' END, now())`,
        [id, no, name, dept, urgent, status, assignee, firstReply],
      );
    await t(1, "Ticket01-01-2026-001", "Somchai", "Front Office · 101", "open", "", true, false); // รอรับ + ด่วน
    await t(2, "Ticket01-01-2026-002", "Nok", "Housekeeping · 205", "open", "Pradit", false, true); // กำลังทำ
    await t(3, "Ticket01-01-2026-003", "Mai", "Sales", "resolved", "Pradit", false, true); // เสร็จ
    const r = async (no: string, name: string, dept: string, status: string, urgent: boolean) => {
      const { rows } = await sql(
        `INSERT INTO reports (ticket_no, ticket_day, seq, reporter_name, department, urgent, status, assignee_name, created_at, done_at)
         VALUES ($1,'01-01-2026',9,$2,$3,$4,$5::text,'',now() - interval '3 hours', CASE WHEN $5::text='done' THEN now() END) RETURNING id`,
        [no, name, dept, urgent, status],
      );
      await sql("INSERT INTO report_items (report_id, topic, text, done) VALUES ($1,'computer','a',$2),($1,'network','b',false)", [rows[0].id, status === "done"]);
    };
    await r("Ticket01-01-2026-010", "Ploy", "hr", "new", false);
    await r("Ticket01-01-2026-011", "Kham", "engineering", "in_progress", true);
    await r("Ticket01-01-2026-012", "Boun", "fnb", "done", false);
  });
  afterAll(async () => {
    await sql("TRUNCATE tickets, reports, report_items, report_events, ticket_counters, ticket_events RESTART IDENTITY CASCADE");
    await (db() as unknown as { end(): Promise<void> }).end();
  });

  test("ยอดรวมแยกตามระบบและสถานะ (แชท: open ที่ยังไม่มีผู้รับ = new)", async () => {
    const d = await getDashboard(all());
    expect(d.totals.chat).toEqual({ new: 1, in_progress: 1, done: 1 });
    expect(d.totals.report).toEqual({ new: 1, in_progress: 1, done: 1 });
    expect(d.totals.openNow).toBe(4);
    expect(d.totals.urgentOpen).toBe(2); // แชท #1 + รายงาน #011
    expect(d.total).toBe(6);
    expect(d.totals.avgFirstResponseMin).not.toBeNull();
    expect(d.perDay).toHaveLength(14);
    expect(d.perDay.reduce((n, x) => n + x.chat + x.report, 0)).toBe(6);
  });

  test("รายการเคสรวมทั้งสองระบบ ใหม่สุดก่อน พร้อมหัวข้อ/แผนกที่แปลงแล้ว", async () => {
    const d = await getDashboard(all());
    const report = d.cases.find((c) => c.ticketNo.endsWith("-010"))!;
    expect(report).toMatchObject({ kind: "report", department: "Human Resources", status: "new", itemsTotal: 2 });
    expect([...report.topics].sort()).toEqual(["cosi-computer", "cosi-network"]);
    const chat = d.cases.find((c) => c.ticketNo.endsWith("-001"))!;
    expect(chat).toMatchObject({ kind: "chat", department: "Front Office", status: "new", urgent: true });
    expect(d.perDepartment.find((x) => x.department === "Front Office")).toMatchObject({ total: 1, open: 1 });
  });

  test("กรองตามประเภท/สถานะ/ค้นหา และแบ่งหน้า", async () => {
    const f = (qs: string) => getDashboard(parseDashboardQuery(new URLSearchParams(qs)));
    expect((await f("kind=chat")).total).toBe(3);
    expect((await f("kind=report&status=done")).cases.map((c) => c.name)).toEqual(["Boun"]);
    expect((await f("status=in_progress")).total).toBe(2);
    expect((await f("q=nok")).cases.map((c) => c.name)).toEqual(["Nok"]);
    expect((await f("q=Ticket01-01-2026-01")).total).toBe(3);
    expect((await f("q=%25")).total).toBe(0); // % ไม่ถูกตีเป็น wildcard
    expect((await f("page=99")).page).toBe(1);
  });

  test("รายละเอียดเคส: แจ้งปัญหา = ข้อย่อย + ประวัติ (ไม่มีบันทึกภายใน) · แชท = ทะเบียน + ประวัติ (ไม่มี token → อ่านข้อความไม่ได้)", async () => {
    delete process.env.CHATWOOT_AGENT_TOKEN;
    const list = await getDashboard(all());
    const rep = list.cases.find((c) => c.kind === "report" && c.ticketNo.endsWith("-011"))!;
    await sql("UPDATE reports SET note = 'ความลับของไอที' WHERE id = $1", [rep.id]);
    await sql("INSERT INTO report_events (report_id, type, actor, detail) VALUES ($1,'created','Kham','{\"topics\":[\"computer\"]}'::jsonb)", [rep.id]);
    const r = (await getCaseDetail("report", rep.id))!;
    expect(r).toMatchObject({ kind: "report", name: "Kham", status: "in_progress", urgent: true });
    expect(r.items).toHaveLength(2);
    expect(r.events[0]).toMatchObject({ type: "created", actor: "Kham", topics: ["computer"] });
    expect(JSON.stringify(r)).not.toContain("ความลับ"); // ไม่ส่งบันทึกภายในให้หัวหน้า

    await sql("INSERT INTO ticket_events (conversation_id, ticket_no, type, actor) VALUES (1,'Ticket01-01-2026-001','created','')");
    const c = (await getCaseDetail("chat", 1))!;
    expect(c).toMatchObject({ kind: "chat", name: "Somchai", department: "Front Office", contact: "101", status: "new", messages: null, messagesState: "no_token" });
    expect(c.events.map((e) => e.type)).toEqual(["created"]);
    expect(await getCaseDetail("chat", 999)).toBeNull();
    expect(await getCaseDetail("report", 999)).toBeNull();
  });
});
