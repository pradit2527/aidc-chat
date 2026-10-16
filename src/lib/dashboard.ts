// ข้อมูลแดชบอร์ดของหัวหน้าโรงแรม — รวมเคส "แชท" (ทะเบียน tickets) และ "แจ้งปัญหา" (reports) ทุกคน ทุกสถานะ — อ่านอย่างเดียว
import { agentToken } from "./chatwoot";
import { cw } from "./cw";
import { DEPARTMENTS } from "./categories";
import { q } from "./db";
import type { Session } from "./session";
import { fetchConversationsSince } from "./ticketMap";
import { registerTickets, unregisteredIds } from "./ticketRegistry";
import { dayStart } from "./tickets";

/** สถานะรวมของทั้งสองระบบ: new = รอรับ · in_progress = กำลังดำเนินการ · done = เสร็จสิ้น */
export type Bucket = "new" | "in_progress" | "done";
export type Kind = "chat" | "report";

export type DashboardQuery = { kind: Kind | "all"; status: Bucket | "all"; q: string; page: number };
export const DASH_PER_PAGE = 15;

export function parseDashboardQuery(p: URLSearchParams): DashboardQuery {
  const kind = p.get("kind");
  const status = p.get("status");
  return {
    kind: kind === "chat" || kind === "report" ? kind : "all",
    status: status === "new" || status === "in_progress" || status === "done" ? status : "all",
    q: (p.get("q") ?? "").trim().slice(0, 60),
    page: Math.max(1, Math.min(10_000, Number(p.get("page")) || 1)),
  };
}

export type CaseRow = {
  kind: Kind;
  id: number;
  ticketNo: string;
  name: string;
  department: string;
  /** chat = ชื่อ label ใน Chatwoot (cosi-network …) · report = cosi-<หมวด> — ใช้ labelName() แปลงได้เหมือนกัน */
  topics: string[];
  urgent: boolean;
  assignee: string;
  status: Bucket;
  /** สถานะดิบ: chat = open|pending|snoozed|resolved · report = new|in_progress|done */
  rawStatus: string;
  createdAt: number;
  firstResponseAt: number | null;
  doneAt: number | null;
  itemsDone: number;
  itemsTotal: number;
};

export type Dashboard = {
  generatedAt: number;
  totals: {
    chat: Record<Bucket, number>;
    report: Record<Bucket, number>;
    openNow: number;
    urgentOpen: number;
    createdToday: number;
    doneToday: number;
    /** นาที (null = ยังไม่มีข้อมูล) — เฉลี่ย 30 วัน */
    avgFirstResponseMin: number | null;
    avgResolveMin: number | null;
  };
  perDay: { day: string; chat: number; report: number; done: number }[];
  perDepartment: { department: string; total: number; open: number }[];
  cases: CaseRow[];
  total: number;
  page: number;
  pages: number;
};

// รวมสองตารางเป็นรายการเดียว — สถานะแชทแปลงเป็น 3 กลุ่ม: resolved → done; open ที่ยังไม่มีผู้รับ → new; ที่เหลือ → in_progress
const FEED = `
  SELECT 'chat'::text AS kind, conversation_id AS id, ticket_no, contact_name AS name,
         split_part(department, ' · ', 1) AS department, labels AS topics, urgent, assignee_name AS assignee,
         CASE WHEN status = 'resolved' THEN 'done'
              WHEN status = 'open' AND assignee_name = '' THEN 'new' ELSE 'in_progress' END AS bucket,
         status AS raw_status, created_at, first_reply_at AS first_response_at, resolved_at AS done_at,
         0 AS items_total, 0 AS items_done
    FROM tickets
  UNION ALL
  SELECT 'report', r.id, r.ticket_no, r.reporter_name, r.department,
         ARRAY(SELECT DISTINCT 'cosi-' || i.topic FROM report_items i WHERE i.report_id = r.id),
         r.urgent, r.assignee_name, r.status, r.status, r.created_at, r.started_at, r.done_at,
         (SELECT count(*) FROM report_items i WHERE i.report_id = r.id)::int,
         (SELECT count(*) FROM report_items i WHERE i.report_id = r.id AND i.done)::int
    FROM reports r`;

const n = (v: unknown) => Number(v ?? 0) || 0;
const nn = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

/** วันที่ (เวลาลาว UTC+7) ย้อนหลัง `days` วัน เรียงเก่า → ใหม่ รูปแบบ YYYY-MM-DD */
function laoDays(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(new Date(Date.now() + 7 * 3600_000 - i * 86_400_000).toISOString().slice(0, 10));
  return out;
}

const deptName = (d: string) => DEPARTMENTS.find((x) => x.id === d)?.label.en ?? d;

// ---- ซิงก์เคสแชทจาก Chatwoot (เฉพาะเมื่อตั้ง CHATWOOT_AGENT_TOKEN) ----
// ทะเบียน tickets ปกติถูกเติมเมื่อคอนโซลแชทโหลดรายการ — เคสที่ไอทียังไม่เคยเปิดดูจะยังไม่อยู่ในแดชบอร์ด
// ถ้ามี token กลาง แดชบอร์ดดึงเคส 3 วันล่าสุดมาลงทะเบียน/อัปเดตสถานะเอง (ไม่เกินนาทีละครั้ง)
let lastSync = 0;
async function syncChats(): Promise<void> {
  if (!agentToken() || Date.now() - lastSync < 60_000) return;
  lastSync = Date.now();
  try {
    const s: Session = { token: "", client: "", uid: "", user: { id: 0, name: "dashboard", email: "" }, local: true, exp: Date.now() + 60_000 };
    const since = dayStart(Math.floor(Date.now() / 1000) - 3 * 86_400);
    const convs = await fetchConversationsSince((p) => cw<unknown>(s, p), since);
    const unknown = new Set(await unregisteredIds(convs.map((c) => c.id)));
    // เคสเก่าที่ยังไม่อยู่ในทะเบียนไม่ลงทะเบียนย้อนหลัง (กันเลขตั๋วของวันเก่าสลับลำดับ)
    await registerTickets(convs.filter((c) => !unknown.has(c.id) || c.createdAt >= since), "dashboard");
  } catch (e) {
    console.error(`[dashboard] sync chats: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getDashboard(query: DashboardQuery): Promise<Dashboard> {
  await syncChats();

  const [totals] = await q<Record<string, unknown>>(`
    WITH f AS (${FEED})
    SELECT count(*) FILTER (WHERE kind = 'chat'   AND bucket = 'new')::int         AS c_new,
           count(*) FILTER (WHERE kind = 'chat'   AND bucket = 'in_progress')::int AS c_prog,
           count(*) FILTER (WHERE kind = 'chat'   AND bucket = 'done')::int        AS c_done,
           count(*) FILTER (WHERE kind = 'report' AND bucket = 'new')::int         AS r_new,
           count(*) FILTER (WHERE kind = 'report' AND bucket = 'in_progress')::int AS r_prog,
           count(*) FILTER (WHERE kind = 'report' AND bucket = 'done')::int        AS r_done,
           count(*) FILTER (WHERE bucket <> 'done' AND urgent)::int                AS urgent_open,
           count(*) FILTER (WHERE (created_at AT TIME ZONE 'Asia/Vientiane')::date = (now() AT TIME ZONE 'Asia/Vientiane')::date)::int AS created_today,
           count(*) FILTER (WHERE (done_at AT TIME ZONE 'Asia/Vientiane')::date = (now() AT TIME ZONE 'Asia/Vientiane')::date)::int AS done_today,
           round(avg(extract(epoch FROM (first_response_at - created_at)) / 60)
                 FILTER (WHERE first_response_at IS NOT NULL AND created_at > now() - interval '30 days'))::text AS avg_first,
           round(avg(extract(epoch FROM (done_at - created_at)) / 60)
                 FILTER (WHERE done_at IS NOT NULL AND created_at > now() - interval '30 days'))::text AS avg_resolve
      FROM f`);

  const days = laoDays(14);
  const dayRows = await q<Record<string, unknown>>(
    `WITH f AS (${FEED})
     SELECT to_char((created_at AT TIME ZONE 'Asia/Vientiane')::date, 'YYYY-MM-DD') AS day,
            count(*) FILTER (WHERE kind = 'chat')::int AS chat, count(*) FILTER (WHERE kind = 'report')::int AS report
       FROM f WHERE created_at > now() - interval '16 days' GROUP BY 1`,
  );
  const doneRows = await q<Record<string, unknown>>(
    `WITH f AS (${FEED})
     SELECT to_char((done_at AT TIME ZONE 'Asia/Vientiane')::date, 'YYYY-MM-DD') AS day, count(*)::int AS done
       FROM f WHERE done_at > now() - interval '16 days' GROUP BY 1`,
  );
  const byDay = new Map(dayRows.map((r) => [String(r.day), r]));
  const doneByDay = new Map(doneRows.map((r) => [String(r.day), n(r.done)]));

  const deptRows = await q<Record<string, unknown>>(
    `WITH f AS (${FEED})
     SELECT department, count(*)::int AS total, count(*) FILTER (WHERE bucket <> 'done')::int AS open
       FROM f WHERE created_at > now() - interval '30 days' GROUP BY department`,
  );
  const dept = new Map<string, { total: number; open: number }>();
  for (const r of deptRows) {
    const k = deptName(String(r.department ?? "").trim()) || "—";
    const cur = dept.get(k) ?? { total: 0, open: 0 };
    dept.set(k, { total: cur.total + n(r.total), open: cur.open + n(r.open) });
  }

  // รายการเคส (กรองได้) — ใหม่สุดก่อน
  const where: string[] = [];
  const params: unknown[] = [];
  if (query.kind !== "all") where.push(`kind = $${params.push(query.kind)}`);
  if (query.status !== "all") where.push(`bucket = $${params.push(query.status)}`);
  if (query.q) {
    const p = `$${params.push(`%${query.q.replace(/[\\%_]/g, "\\$&")}%`)}`;
    where.push(`(name ILIKE ${p} OR ticket_no ILIKE ${p} OR department ILIKE ${p})`);
  }
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [{ count } = { count: 0 }] = await q<{ count: number }>(`WITH f AS (${FEED}) SELECT count(*)::int AS count FROM f ${w}`, params);
  const total = n(count);
  const pages = Math.max(1, Math.ceil(total / DASH_PER_PAGE));
  const page = Math.min(query.page, pages);
  const rows = await q<Record<string, unknown>>(
    `WITH f AS (${FEED})
     SELECT kind, id::text AS id, ticket_no, name, department, topics, urgent, assignee, bucket, raw_status, items_total, items_done,
            extract(epoch FROM created_at)::bigint::text AS created, extract(epoch FROM first_response_at)::bigint::text AS first_at,
            extract(epoch FROM done_at)::bigint::text AS done
       FROM f ${w} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, DASH_PER_PAGE, (page - 1) * DASH_PER_PAGE],
  );

  const t = totals ?? {};
  return {
    generatedAt: Math.floor(Date.now() / 1000),
    totals: {
      chat: { new: n(t.c_new), in_progress: n(t.c_prog), done: n(t.c_done) },
      report: { new: n(t.r_new), in_progress: n(t.r_prog), done: n(t.r_done) },
      openNow: n(t.c_new) + n(t.c_prog) + n(t.r_new) + n(t.r_prog),
      urgentOpen: n(t.urgent_open),
      createdToday: n(t.created_today),
      doneToday: n(t.done_today),
      avgFirstResponseMin: nn(t.avg_first),
      avgResolveMin: nn(t.avg_resolve),
    },
    perDay: days.map((d) => ({ day: d, chat: n(byDay.get(d)?.chat), report: n(byDay.get(d)?.report), done: doneByDay.get(d) ?? 0 })),
    perDepartment: [...dept].map(([department, v]) => ({ department, ...v })).sort((a, b) => b.total - a.total),
    cases: rows.map((r) => ({
      kind: r.kind === "report" ? "report" : "chat",
      id: n(r.id),
      ticketNo: String(r.ticket_no),
      name: String(r.name ?? ""),
      department: deptName(String(r.department ?? "").trim()),
      topics: Array.isArray(r.topics) ? (r.topics as string[]) : [],
      urgent: r.urgent === true,
      assignee: String(r.assignee ?? ""),
      status: r.bucket === "done" ? "done" : r.bucket === "new" ? "new" : "in_progress",
      rawStatus: String(r.raw_status),
      createdAt: n(r.created),
      firstResponseAt: nn(r.first_at),
      doneAt: nn(r.done),
      itemsDone: n(r.items_done),
      itemsTotal: n(r.items_total),
    })),
    total,
    page,
    pages,
  };
}
