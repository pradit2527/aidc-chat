// คอนโซลไอทีครบวงจร: ล็อกอิน → รายการ/เลขตั๋ว → ทักทายอัตโนมัติ → ตอบ/โน้ต → ปิดหัวข้อ/ปิดเคส → เปิดใหม่ → มอบหมาย → สถิติ
// รันกับ Chatwoot จำลอง (cotester/e2e/mock-chatwoot.mjs) และฐานทดสอบ aidc_chat_test (ล้างก่อน/หลัง)
import { neon } from "@neondatabase/serverless";
import { AUTO_GREETING_TEXT } from "@/lib/autoGreeting";
import { ticketDate } from "@/lib/tickets";
import { Client, waitFor } from "./client";

const DB = process.env.E2E_DATABASE_URL ?? "";
if (!DB) throw new Error("ต้องตั้ง E2E_DATABASE_URL (รันผ่าน npm run test:e2e)");
if (/\/neondb(\?|$)/.test(DB)) throw new Error("ไม่ยอมรันกับฐานข้อมูลจริง (neondb)");
const sql = neon(DB);
const q = (text: string, params: unknown[] = []) => sql.query(text, params) as Promise<Record<string, unknown>[]>;
const n = (v: unknown) => Number(v);

type Conv = {
  id: number;
  status: string;
  unread: number;
  ticket: string | null;
  name: string;
  subtitle: string;
  labels: string[];
  closedTopics: string[];
  assignee: { id: number; name: string } | null;
  createdAt: number;
};
type Msg = { id: number; kind: string; content: string; private: boolean; senderName: string; attachments: { name: string; type: string }[] };

const c = new Client();
const MOCK_LOGIN = { email: "it.test@example.invalid", password: "mock-only-password" };
const AGENT = "Pradit Ratthanoo";

const list = async (status = "open", extra = "") =>
  ((await c.get(`/api/admin/conversations?status=${status}${extra}`)).json as { conversations: Conv[] }).conversations;
const messages = async (id: number) => ((await c.get(`/api/admin/conversations/${id}/messages`)).json as { messages: Msg[] }).messages;
const greetings = (ms: Msg[]) => ms.filter((m) => m.kind === "outgoing" && !m.private && m.content === AUTO_GREETING_TEXT).length;
const stats = async (extra = "") => (await c.get(`/api/admin/stats${extra}`)).json as Record<string, any>;
const events = async (id: number) => (await q("SELECT type, actor FROM ticket_events WHERE conversation_id = $1 ORDER BY id", [id])) as { type: string; actor: string }[];

/** เลขตั๋วที่ควรได้: จัดกลุ่มตามวันสร้าง (เวลาลาว) เรียงเวลาสร้าง นับ 001… */
function expectedTickets(all: Conv[]) {
  const byDay = new Map<string, Conv[]>();
  for (const cv of [...all].sort((a, b) => a.createdAt - b.createdAt || a.id - b.id)) {
    const d = ticketDate(cv.createdAt);
    byDay.set(d, [...(byDay.get(d) ?? []), cv]);
  }
  const out = new Map<number, string>();
  for (const [d, convs] of byDay) convs.forEach((cv, i) => out.set(cv.id, `Ticket${d}-${String(i + 1).padStart(3, "0")}`));
  return out;
}

beforeAll(async () => {
  await q("TRUNCATE reports, report_items, report_events, tickets, ticket_events, ticket_counters RESTART IDENTITY");
});
afterAll(async () => {
  await q("TRUNCATE reports, report_items, report_events, tickets, ticket_events, ticket_counters RESTART IDENTITY");
});

describe("1. ล็อกอิน", () => {
  test("รหัสผิด → 401, ข้อมูลไม่ครบ → 400, ไม่ออกคุกกี้", async () => {
    expect((await c.post("/api/admin/login", { ...MOCK_LOGIN, password: "wrong" })).status).toBe(401);
    expect((await c.post("/api/admin/login", { email: MOCK_LOGIN.email })).status).toBe(400);
    expect(c.cookie("cosi_admin")).toBeUndefined();
  });
  test("ถูกต้อง → 200 + คุกกี้ cosi_admin และ /me คืนผู้ใช้", async () => {
    const r = await c.post("/api/admin/login", MOCK_LOGIN);
    expect(r.status).toBe(200);
    expect(r.json).toEqual({ user: { id: 1, name: AGENT, email: MOCK_LOGIN.email } });
    expect(c.cookie("cosi_admin")).toBeTruthy();
    expect((await c.get("/api/admin/me")).json).toEqual({ user: { id: 1, name: AGENT, email: MOCK_LOGIN.email } });
  });
});

describe("2. รายการเคสและเลขตั๋วถาวร", () => {
  test("แท็บเปิด 4 เคส ทุกเคสมีเลขตั๋ว; ลำดับเลขตั๋วตรงกับเวลาสร้างจริงทั้งวัน (รวมเคสที่ปิดแล้ว)", async () => {
    const open = await list("open");
    expect(open.map((x) => x.id).sort()).toEqual([16, 18, 19, 20]);
    const all = await list("all");
    expect(all.map((x) => x.id).sort()).toEqual([15, 16, 18, 19, 20]);
    const expected = expectedTickets(all);
    for (const cv of [...open, ...all]) expect(cv.ticket).toBe(expected.get(cv.id));
    // ฐานข้อมูล: 5 แถว เลขไม่ซ้ำ ตัวนับตรงกับจำนวน
    const rows = await q("SELECT conversation_id::int AS id, ticket_no, ticket_day, seq FROM tickets ORDER BY ticket_day, seq");
    expect(rows).toHaveLength(5);
    expect(new Set(rows.map((r) => r.ticket_no)).size).toBe(5);
    for (const r of rows) expect(r.ticket_no).toBe(expected.get(n(r.id)));
    const counters = await q("SELECT day, seq FROM ticket_counters");
    for (const ct of counters) expect(n(ct.seq)).toBe(rows.filter((r) => r.ticket_day === ct.day).length);
  });

  test("ข้อมูลเคสถูกแปลงครบ: ชื่อ/แผนก, ป้าย, หัวข้อที่ปิดแล้ว, ผู้รับผิดชอบ, ตัวเลขรอตอบ", async () => {
    const open = await list("open");
    const c20 = open.find((x) => x.id === 20)!;
    expect(c20).toMatchObject({ name: "นาง นานา มารีน่า", subtitle: "Front Office · 0201112222", labels: ["cosi-network"], assignee: { id: 1, name: AGENT } });
    expect(c20.unread).toBeGreaterThanOrEqual(1); // ลูกค้าส่งล่าสุด
    expect(open.find((x) => x.id === 16)!.closedTopics).toEqual(["cosi-account"]);
    expect(open.find((x) => x.id === 19)!.labels).toContain("cosi-urgent");
  });

  test("กรองตามป้าย cosi-computer → 2 เคส; ป้าย/สถานะไม่ถูกต้องถูกละเว้น", async () => {
    expect((await list("open", "&label=cosi-computer")).map((x) => x.id).sort()).toEqual([18, 19]);
    expect(await list("open", "&label=bad%20label!")).toHaveLength(4);
    expect(await list("bogus")).toHaveLength(4);
  });

  test("ป้ายกำกับ + จำนวนงาน: นับเฉพาะหัวข้อที่ยังไม่ปิด และไม่รวม label ที่ไม่ใช่ cosi-", async () => {
    const r = (await c.get("/api/admin/labels")).json as { totals: Record<string, number>; labels: { title: string; open: number; total: number }[] };
    expect(r.totals).toEqual({ open: 4, resolved: 1, all: 5 });
    const by = Object.fromEntries(r.labels.map((l) => [l.title, l]));
    expect(by["cosi-computer"]).toMatchObject({ open: 2, total: 3 });
    expect(by["cosi-account"]).toMatchObject({ open: 0, total: 1 }); // #16 ปิดหัวข้อนี้แล้ว
    expect(by["cosi-urgent"]).toMatchObject({ open: 1, total: 1 });
    expect(by["support"]).toBeUndefined();
  });
});

describe("3. คำทักทายอัตโนมัติ", () => {
  test("เคส #19 และ #18 (ลูกค้าเริ่มแชทใหม่) ได้รับคำทักทาย 1 ครั้งในชื่อเจ้าหน้าที่; #20 (คุยต่อเนื่อง) ไม่ได้", async () => {
    const m19 = await waitFor(() => messages(19), (ms) => greetings(ms) >= 1, 15_000);
    expect(greetings(m19)).toBe(1);
    expect(m19.find((m) => m.content === AUTO_GREETING_TEXT)!.senderName).toBe(AGENT);
    const m18 = await waitFor(() => messages(18), (ms) => greetings(ms) >= 1, 15_000);
    expect(greetings(m18)).toBe(1);
    expect(greetings(await messages(20))).toBe(0);
  });
  test("โพลล์รายการซ้ำแล้วไม่ทักซ้ำ และบันทึกเหตุการณ์ greeted ในทะเบียน", async () => {
    await list("open");
    await list("open");
    await new Promise((r) => setTimeout(r, 2500));
    expect(greetings(await messages(19))).toBe(1);
    expect(greetings(await messages(18))).toBe(1);
    expect((await events(19)).filter((e) => e.type === "greeted")).toEqual([{ type: "greeted", actor: AGENT }]);
  });
});

describe("4. ข้อความ: อ่าน / ตอบ / บันทึกภายใน", () => {
  test("อ่านข้อความเรียงเวลา และแปลงไฟล์แนบ", async () => {
    const ms = await messages(19);
    for (let i = 1; i < ms.length; i++) expect(ms[i].id).toBeGreaterThan(ms[i - 1].id);
    expect(ms[0].attachments[0]).toMatchObject({ name: "img.png", type: "image" });
  });
  test("ตอบลูกค้า → outgoing ในชื่อเจ้าหน้าที่ + บันทึกเวลาตอบครั้งแรก; บันทึกภายใน → private", async () => {
    const r = await c.post("/api/admin/conversations/19/messages", { content: "รับเรื่องแล้วครับ" });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ message: { kind: "outgoing", private: false, senderName: AGENT, content: "รับเรื่องแล้วครับ" } });
    const note = await c.post("/api/admin/conversations/19/messages", { content: "โน้ตภายใน", private: true });
    expect(note.json).toMatchObject({ message: { private: true } });
    const [row] = await q("SELECT first_reply_at FROM tickets WHERE conversation_id = 19");
    expect(row.first_reply_at).not.toBeNull();
    expect((await events(19)).map((e) => e.type)).toEqual(expect.arrayContaining(["replied", "note"]));
  });
  test("ตรวจสอบ input: ว่าง/ยาวเกิน 5000 → 400, id ผิด → 400, Origin แปลก → 403, เคสไม่มี → 404", async () => {
    expect((await c.post("/api/admin/conversations/19/messages", { content: "   " })).status).toBe(400);
    expect((await c.post("/api/admin/conversations/19/messages", { content: "x".repeat(5001) })).status).toBe(400);
    expect((await c.post("/api/admin/conversations/abc/messages", { content: "x" })).status).toBe(400);
    expect((await c.post("/api/admin/conversations/19/messages", { content: "x" }, { origin: "http://evil.test" })).status).toBe(403);
    expect((await c.post("/api/admin/conversations/999/messages", { content: "x" })).status).toBe(404);
  });
});

describe("5. ปิดหัวข้อ / ปิดเคส (Modal ปิดเคส)", () => {
  test("ปิดบางหัวข้อ → เคสยังเปิด และลูกค้าได้ข้อความแจ้งหัวข้อที่ค้าง", async () => {
    const before = (await messages(19)).length;
    const r = await c.post("/api/admin/conversations/19/topics", { close: ["cosi-computer"] });
    expect(r.json).toEqual({ closedTopics: ["cosi-computer"], resolved: false });
    const ms = await messages(19);
    expect(ms.length).toBe(before + 1);
    const last = ms[ms.length - 1];
    expect(last.private).toBe(false);
    expect(last.content).toContain("⏳ ຍັງດຳເນີນການຢູ່: ອື່ນໆ");
    expect((await list("open")).find((x) => x.id === 19)!.closedTopics).toEqual(["cosi-computer"]);
  });
  test("ปิดหัวข้อสุดท้าย → resolved, ข้อความแจ้งมีเลขตั๋ว, หายจากแท็บเปิด, ทะเบียนอัปเดตทันที", async () => {
    const ticket = (await list("open")).find((x) => x.id === 19)!.ticket!;
    const r = await c.post("/api/admin/conversations/19/topics", { close: ["cosi-other"], note: "แก้ไขแล้ว" });
    expect(r.json).toEqual({ closedTopics: ["cosi-computer", "cosi-other"], resolved: true });
    const ms = await messages(19);
    const publicLast = [...ms].reverse().find((m) => !m.private)!;
    expect(publicLast.content).toContain(`ເຄສ ${ticket} : Lao Development Bank ຖືກປິດແລ້ວ`); // เลขตั๋ว + ชื่อผู้แจ้ง
    expect(publicLast.content).toContain(`Case ${ticket} : Lao Development Bank is now closed`);
    expect(ms.some((m) => m.private && m.content === "แก้ไขแล้ว")).toBe(true);
    expect((await list("open")).map((x) => x.id)).not.toContain(19);
    expect((await list("all")).find((x) => x.id === 19)).toMatchObject({ status: "resolved", closedTopics: ["cosi-computer", "cosi-other"] });
    const [row] = await q("SELECT status, resolved_at FROM tickets WHERE conversation_id = 19");
    expect(row.status).toBe("resolved");
    expect(row.resolved_at).not.toBeNull();
    expect((await events(19)).filter((e) => e.type === "topic_closed")).toHaveLength(2);
    expect((await events(19)).some((e) => e.type === "resolved" && e.actor === AGENT)).toBe(true);
    expect((await stats()).summary).toMatchObject({ openNow: 3 });
  });
  test("ปิดหัวข้อที่เคสไม่มี → ไม่เปลี่ยนอะไร ไม่ส่งข้อความ; body ผิด → 400", async () => {
    const before = (await messages(20)).length;
    expect((await c.post("/api/admin/conversations/20/topics", { close: ["cosi-pms"] })).json).toEqual({ closedTopics: [], resolved: false });
    expect((await messages(20)).length).toBe(before);
    expect((await c.post("/api/admin/conversations/20/topics", { close: "cosi-pms" })).status).toBe(400);
  });
});

describe("6. เปลี่ยนสถานะ / มอบหมาย / อ่านแล้ว", () => {
  test("เปิดเคส #19 ใหม่ → ล้างหัวข้อที่ปิด, ทะเบียนบันทึก reopened, สถิติเปิดอยู่กลับเป็น 4", async () => {
    expect((await c.post("/api/admin/conversations/19/status", { status: "open" })).json).toEqual({ ok: true, status: "open" });
    expect((await list("open")).find((x) => x.id === 19)).toMatchObject({ status: "open", closedTopics: [] });
    const [row] = await q("SELECT status, resolved_at FROM tickets WHERE conversation_id = 19");
    expect(row).toEqual({ status: "open", resolved_at: null });
    expect((await events(19)).some((e) => e.type === "reopened")).toBe(true);
    expect((await stats()).summary.openNow).toBe(4);
  });
  test("ปิดเคสตรง ๆ ด้วย status=resolved; ค่าอื่น → 400", async () => {
    expect((await c.post("/api/admin/conversations/19/status", { status: "resolved" })).status).toBe(200);
    expect((await q("SELECT status FROM tickets WHERE conversation_id = 19"))[0].status).toBe("resolved");
    expect((await c.post("/api/admin/conversations/19/status", { status: "snoozed" })).status).toBe(400);
  });
  test("มอบหมาย #18 ให้ Decha → รายการและทะเบียนอัปเดต; ยกเลิกได้; id ผิด → 400", async () => {
    expect((await c.post("/api/admin/conversations/18/assign", { assigneeId: 2 })).json).toEqual({ ok: true });
    expect((await list("open")).find((x) => x.id === 18)!.assignee).toEqual({ id: 2, name: "Decha" });
    expect((await q("SELECT assignee_name FROM tickets WHERE conversation_id = 18"))[0].assignee_name).toBe("Decha");
    expect((await events(18)).some((e) => e.type === "assigned" && e.actor === AGENT)).toBe(true);
    expect((await c.post("/api/admin/conversations/18/assign", { assigneeId: null })).status).toBe(200);
    expect((await list("open")).find((x) => x.id === 18)!.assignee).toBeNull();
    expect((await c.post("/api/admin/conversations/18/assign", { assigneeId: 0 })).status).toBe(400);
    expect((await c.post("/api/admin/conversations/18/assign", { assigneeId: "2" })).status).toBe(400);
  });
  test("ทำเครื่องหมายอ่านแล้ว", async () => {
    expect((await c.post("/api/admin/conversations/20/read", {})).json).toEqual({ ok: true });
    expect((await c.post("/api/admin/conversations/x/read", {})).status).toBe(400);
  });
});

describe("7. ข้อมูลประกอบคอนโซล", () => {
  test("คำตอบด่วน + รายชื่อ agent", async () => {
    const r = (await c.get("/api/admin/canned")).json as { canned: { shortCode: string }[]; agents: { id: number; name: string }[] };
    expect(r.canned.map((x) => x.shortCode)).toEqual(["ack"]);
    expect(r.agents.map((a) => a.name).sort()).toEqual(["Decha", AGENT].sort());
  });
  test("ข้อมูลช่องแชท", async () => {
    expect((await c.get("/api/admin/inbox")).json).toEqual({ id: 5, name: "COSI Hotel Support", channel: "Channel::WebWidget" });
  });
});

describe("8. สถิติจากทะเบียน", () => {
  test("สรุป/รายวัน/ตามป้าย/ตามเจ้าหน้าที่/ล่าสุด สอดคล้องกับทะเบียน", async () => {
    const s = await stats("?days=7");
    expect(s.enabled).toBe(true);
    expect(s.days).toBe(7);
    expect(s.summary.total).toBe(5);
    expect(s.summary.openNow).toBe(3); // #19 ถูกปิดอีกครั้งในข้อ 6
    expect(s.summary.resolvedToday).toBeGreaterThanOrEqual(1);
    expect(s.summary.avgFirstReplyMin).not.toBeNull();
    expect(s.perDay.reduce((a: number, d: { created: number }) => a + d.created, 0)).toBe(5);
    expect(s.perLabel.find((l: { label: string }) => l.label === "cosi-computer")).toMatchObject({ total: 3 });
    expect(s.perAgent.find((a: { agent: string }) => a.agent === AGENT).total).toBeGreaterThanOrEqual(4);
    expect(s.recent).toHaveLength(5);
    expect(s.recent[0].id).toBe(20); // สร้างล่าสุด
    expect(s.recent.every((r: { ticketNo: string }) => /^Ticket\d{2}-\d{2}-\d{4}-\d{3}$/.test(r.ticketNo))).toBe(true);
  });
  test("ช่วงวัน: ค่าไม่ถูกต้อง/0 → ค่าเริ่มต้น 14, ติดลบ → 1, เกิน → 365", async () => {
    expect((await stats("?days=abc")).days).toBe(14);
    expect((await stats("?days=0")).days).toBe(14);
    expect((await stats("?days=-5")).days).toBe(1);
    expect((await stats("?days=99999")).days).toBe(365);
  });
  test("ทะเบียนเหตุการณ์ครบและทุกเหตุการณ์ผูกกับเลขตั๋ว", async () => {
    const types = (await q("SELECT type, count(*)::int AS n FROM ticket_events GROUP BY type")).reduce(
      (acc, r) => ({ ...acc, [String(r.type)]: n(r.n) }),
      {} as Record<string, number>,
    );
    expect(types.created).toBe(5);
    expect(types.greeted).toBe(2);
    expect(types.replied).toBe(1);
    expect(types.note).toBe(1);
    expect(types.topic_closed).toBe(2);
    expect(types.resolved).toBeGreaterThanOrEqual(2);
    expect(types.reopened).toBe(1);
    expect(types.assigned).toBe(1);
    expect(n((await q("SELECT count(*)::int AS n FROM ticket_events WHERE ticket_no IS NULL"))[0].n)).toBe(0);
  });
});

describe("9. ออกจากระบบและการจำกัดความถี่", () => {
  test("logout → คุกกี้ถูกลบ และ API ตอบ 401", async () => {
    expect((await c.post("/api/admin/logout", {})).json).toEqual({ ok: true });
    expect(c.cookie("cosi_admin")).toBeUndefined();
    expect((await c.get("/api/admin/me")).status).toBe(401);
  });
  test("ล็อกอินผิดซ้ำ 10 ครั้งจาก IP เดียว → ครั้งที่ 11 ได้ 429", async () => {
    const h = { "x-forwarded-for": "198.51.100.7" };
    for (let i = 0; i < 10; i++) {
      expect((await c.post("/api/admin/login", { ...MOCK_LOGIN, password: "wrong" }, { headers: h })).status).toBe(401);
    }
    expect((await c.post("/api/admin/login", { ...MOCK_LOGIN, password: "wrong" }, { headers: h })).status).toBe(429);
  });
});
