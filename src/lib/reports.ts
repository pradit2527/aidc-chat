// งานแจ้งปัญหาแบบรายการ (ไม่ผ่านแชท) — พนักงานเลือกหัวข้อ + พิมพ์ปัญหาเป็นข้อ ๆ ส่งให้ไอที, ไอทีรับงาน/ติ๊กข้อ/ปิดงาน
// เก็บใน Neon (ตาราง reports / report_items / report_events) ใช้เลขตั๋วชุดเดียวกับเคสแชท
import { CATEGORIES, DEPARTMENTS } from "./categories";
import { db, dbEnabled, q } from "./db";
import { lockTicketDay, nextTicketSeq } from "./ticketRegistry";
import { formatTicket, isTicketNo, ticketDate } from "./tickets";
import { fileKind, type ReportFileDTO } from "./uploadRules";

export type ReportStatus = "new" | "in_progress" | "done";
export const REPORT_STATUSES: ReportStatus[] = ["new", "in_progress", "done"];

export type ReportItemDTO = {
  id: number;
  topic: string;
  text: string;
  done: boolean;
  /** วินาที */
  doneAt: number | null;
  doneBy: string;
};

export type ReportDTO = {
  id: number;
  ticketNo: string;
  name: string;
  department: string;
  contact: string;
  urgent: boolean;
  status: ReportStatus;
  assignee: string;
  note: string;
  createdAt: number;
  startedAt: number | null;
  doneAt: number | null;
  updatedAt: number;
  items: ReportItemDTO[];
  /** ไฟล์แนบ (รูป/วิดีโอ) — ดาวน์โหลดผ่าน /api/reports/files/<id> */
  files: ReportFileDTO[];
};

export type ReportInput = {
  name: string;
  department: string;
  contact: string;
  identifier: string;
  urgent: boolean;
  topics: { topic: string; items: string[] }[];
  /** ไฟล์ที่อัปโหลดไว้ก่อน (id + token จาก POST /api/reports/upload) */
  files: { id: number; token: string }[];
};

export const REPORT_LIMITS = { topics: CATEGORIES.length, itemsPerTopic: 20, itemsTotal: 50, itemLength: 300 };

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, max) : "";

/** ตรวจและทำความสะอาด body ของ POST /api/reports — คืน error code สั้น ๆ ให้หน้าเว็บแปลเอง */
export function parseReportInput(body: unknown): { ok: true; value: ReportInput } | { ok: false; error: string } {
  const b = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  if (!b) return { ok: false, error: "bad_request" };
  const name = clean(b.name, 80);
  if (!name) return { ok: false, error: "name_required" };
  const department = typeof b.department === "string" ? b.department : "";
  if (!DEPARTMENTS.some((d) => d.id === department)) return { ok: false, error: "department_required" };
  const contact = clean(b.contact, 40);
  const identifier = typeof b.identifier === "string" && /^cosi_[0-9a-f]{24}$/.test(b.identifier) ? b.identifier : "";
  const urgent = b.urgent === true;
  if (!Array.isArray(b.topics)) return { ok: false, error: "topics_required" };

  const seen = new Set<string>();
  const topics: ReportInput["topics"] = [];
  for (const raw of b.topics) {
    const t = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
    const topic = typeof t?.topic === "string" ? t.topic.replace(/^cosi-/, "") : "";
    if (!CATEGORY_IDS.has(topic)) return { ok: false, error: "topic_invalid" };
    if (seen.has(topic)) continue;
    seen.add(topic);
    const items = (Array.isArray(t?.items) ? t.items : [])
      .map((x) => clean(x, REPORT_LIMITS.itemLength))
      .filter(Boolean);
    if (items.length > REPORT_LIMITS.itemsPerTopic) return { ok: false, error: "too_many_items" };
    if (items.length) topics.push({ topic, items });
  }
  const total = topics.reduce((n, t) => n + t.items.length, 0);
  if (total === 0) return { ok: false, error: "items_required" };
  if (total > REPORT_LIMITS.itemsTotal) return { ok: false, error: "too_many_items" };
  const files: ReportInput["files"] = [];
  for (const raw of Array.isArray(b.files) ? b.files : []) {
    const f = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
    if (!f || typeof f.id !== "number" || !Number.isInteger(f.id) || typeof f.token !== "string" || !/^[0-9a-f]{32}$/.test(f.token)) {
      return { ok: false, error: "file_invalid" };
    }
    if (!files.some((x) => x.id === f.id)) files.push({ id: f.id, token: f.token });
  }
  if (files.length > 5) return { ok: false, error: "too_many_files" };
  return { ok: true, value: { name, department, contact, identifier, urgent, topics, files } };
}

// ---------- แถว → DTO ----------

type Row = Record<string, unknown>;
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const SELECT = `
  SELECT r.id::text AS id, r.ticket_no, r.reporter_name, r.department, r.contact, r.urgent, r.status, r.assignee_name, r.note,
         floor(extract(epoch from r.created_at))::int AS created_at,
         floor(extract(epoch from r.started_at))::int AS started_at,
         floor(extract(epoch from r.done_at))::int AS done_at,
         floor(extract(epoch from r.updated_at))::int AS updated_at,
         COALESCE((SELECT json_agg(json_build_object('id', i.id, 'topic', i.topic, 'text', i.text, 'done', i.done,
                                                     'doneAt', floor(extract(epoch from i.done_at))::int, 'doneBy', i.done_by)
                                   ORDER BY i.position, i.id)
                     FROM report_items i WHERE i.report_id = r.id), '[]'::json) AS items,
         COALESCE((SELECT json_agg(json_build_object('id', f.id, 'name', f.original_name, 'mime', f.mime, 'size', f.size) ORDER BY f.id)
                     FROM report_files f WHERE f.report_id = r.id), '[]'::json) AS files
    FROM reports r`;

function toDTO(r: Row): ReportDTO {
  const items = (Array.isArray(r.items) ? r.items : []) as Row[];
  const files = (Array.isArray(r.files) ? r.files : []) as Row[];
  return {
    id: Number(r.id),
    ticketNo: String(r.ticket_no),
    name: String(r.reporter_name),
    department: String(r.department ?? ""),
    contact: String(r.contact ?? ""),
    urgent: r.urgent === true,
    status: (REPORT_STATUSES as string[]).includes(String(r.status)) ? (r.status as ReportStatus) : "new",
    assignee: String(r.assignee_name ?? ""),
    note: String(r.note ?? ""),
    createdAt: num(r.created_at) ?? 0,
    startedAt: num(r.started_at),
    doneAt: num(r.done_at),
    updatedAt: num(r.updated_at) ?? 0,
    items: items.map((i) => ({
      id: Number(i.id),
      topic: String(i.topic),
      text: String(i.text),
      done: i.done === true,
      doneAt: num(i.doneAt),
      doneBy: String(i.doneBy ?? ""),
    })),
    files: files.map((f) => ({
      id: Number(f.id),
      name: String(f.name),
      mime: String(f.mime),
      size: Number(f.size),
      kind: fileKind(String(f.mime)) ?? "image",
    })),
  };
}

/** มุมมองสำหรับเจ้าของรายงาน (พนักงาน) — ไม่มีบันทึกภายในของไอที */
export const publicView = (r: ReportDTO): Omit<ReportDTO, "note"> => {
  const copy: Partial<ReportDTO> = { ...r };
  delete copy.note;
  return copy as Omit<ReportDTO, "note">;
};

// ---------- สร้าง / อ่าน ----------

export async function createReport(input: ReportInput): Promise<{ id: number; ticketNo: string }> {
  if (!dbEnabled) throw new Error("DATABASE_URL ยังไม่ได้ตั้งค่า");
  const day = ticketDate(Math.floor(Date.now() / 1000));
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    await lockTicketDay(client, day);
    const seq = await nextTicketSeq(client, day);
    const ticketNo = formatTicket(day, seq);
    const ins = await client.query(
      `INSERT INTO reports (ticket_no, ticket_day, seq, reporter_name, department, contact, identifier, urgent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id::text`,
      [ticketNo, day, seq, input.name, input.department, input.contact, input.identifier, input.urgent],
    );
    const id = Number(ins.rows[0].id);
    let pos = 0;
    for (const t of input.topics) {
      for (const text of t.items) {
        await client.query("INSERT INTO report_items (report_id, topic, text, position) VALUES ($1, $2, $3, $4)", [id, t.topic, text, pos++]);
      }
    }
    // ผูกไฟล์ที่อัปโหลดไว้ก่อน (ต้องเป็นไฟล์ที่ยังไม่ผูกกับรายงานอื่นและ token ตรง) — ไฟล์ที่ไม่ตรงถูกข้ามเงียบ ๆ
    let attached = 0;
    for (const f of input.files) {
      const r = await client.query(
        "UPDATE report_files SET report_id = $1 WHERE id = $2 AND token = $3 AND report_id IS NULL",
        [id, f.id, f.token],
      );
      attached += r.rowCount ?? 0;
    }
    await client.query("INSERT INTO report_events (report_id, type, actor, detail) VALUES ($1, 'created', $2, $3::jsonb)", [
      id,
      input.name,
      JSON.stringify({ topics: input.topics.map((t) => t.topic), items: pos, urgent: input.urgent, files: attached }),
    ]);
    await client.query("COMMIT");
    return { id, ticketNo };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export async function getReport(id: number): Promise<ReportDTO | null> {
  const rows = await q<Row>(`${SELECT} WHERE r.id = $1`, [id]);
  return rows[0] ? toDTO(rows[0]) : null;
}

export { isTicketNo } from "./tickets";

/** id ของรายงานจากเลขตั๋ว (ลิงก์ในแจ้งเตือน WhatsApp ใช้เลขตั๋ว) — ไม่พบ → null */
export async function findReportIdByTicket(ticketNo: string): Promise<number | null> {
  if (!isTicketNo(ticketNo)) return null;
  const [row] = await q<{ id: string }>("SELECT id::text AS id FROM reports WHERE ticket_no = $1", [ticketNo]);
  return row ? Number(row.id) : null;
}

/** เจ้าของดูรายงานของตัวเอง: ต้องรู้ทั้งเลขตั๋วและ identifier ของเครื่องที่ส่ง */
export async function getReportForOwner(ticketNo: string, identifier: string): Promise<ReportDTO | null> {
  if (!isTicketNo(ticketNo) || !/^cosi_[0-9a-f]{24}$/.test(identifier)) return null;
  const rows = await q<Row>(`${SELECT} WHERE r.ticket_no = $1 AND r.identifier = $2`, [ticketNo, identifier]);
  return rows[0] ? toDTO(rows[0]) : null;
}

export async function listReports(status: ReportStatus | "all", limit = 200): Promise<ReportDTO[]> {
  const where = status === "all" ? "" : "WHERE r.status = $2";
  const params: unknown[] = status === "all" ? [limit] : [limit, status];
  // งานใหม่/กำลังทำ: ด่วนก่อน แล้วเก่าก่อน (รอนานกว่า); งานเสร็จ: ล่าสุดก่อน
  const order = status === "done" ? "ORDER BY r.done_at DESC NULLS LAST" : "ORDER BY r.urgent DESC, r.created_at ASC";
  const rows = await q<Row>(`${SELECT} ${where} ${status === "all" ? "ORDER BY r.created_at DESC" : order} LIMIT $1`, params);
  return rows.map(toDTO);
}

export type OwnerReportRow = {
  id: number;
  ticketNo: string;
  status: ReportStatus;
  assignee: string;
  urgent: boolean;
  createdAt: number;
  doneAt: number | null;
  itemsDone: number;
  itemsTotal: number;
};

/** รายงานทั้งหมดของพนักงานคนหนึ่ง (identifier เดียวกัน) เรียงล่าสุดก่อน แบ่งหน้า */
export async function listReportsForOwner(identifier: string, page = 1, perPage = 30) {
  if (!/^cosi_[0-9a-f]{24}$/.test(identifier)) return { reports: [] as OwnerReportRow[], total: 0, page: 1, pages: 1, perPage };
  const [c] = await q<{ n: string }>("SELECT count(*)::int::text AS n FROM reports WHERE identifier = $1", [identifier]);
  const total = Number(c?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const cur = Math.min(Math.max(1, page), pages);
  const rows = await q<Record<string, unknown>>(
    `SELECT r.id::text AS id, r.ticket_no, r.status, r.assignee_name, r.urgent,
            floor(extract(epoch from r.created_at))::int AS created_at, floor(extract(epoch from r.done_at))::int AS done_at,
            (SELECT count(*) FILTER (WHERE i.done) FROM report_items i WHERE i.report_id = r.id)::int AS items_done,
            (SELECT count(*) FROM report_items i WHERE i.report_id = r.id)::int AS items_total
       FROM reports r WHERE r.identifier = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
    [identifier, perPage, (cur - 1) * perPage],
  );
  const reports: OwnerReportRow[] = rows.map((r) => ({
    id: Number(r.id),
    ticketNo: String(r.ticket_no),
    status: (REPORT_STATUSES as string[]).includes(String(r.status)) ? (r.status as ReportStatus) : "new",
    assignee: String(r.assignee_name ?? ""),
    urgent: r.urgent === true,
    createdAt: num(r.created_at) ?? 0,
    doneAt: num(r.done_at),
    itemsDone: Number(r.items_done ?? 0),
    itemsTotal: Number(r.items_total ?? 0),
  }));
  return { reports, total, page: cur, pages, perPage };
}

export async function reportSummary(): Promise<{ new: number; inProgress: number; done: number }> {
  const [r] = await q<Record<string, string>>(
    `SELECT count(*) FILTER (WHERE status = 'new')::int::text AS n,
            count(*) FILTER (WHERE status = 'in_progress')::int::text AS p,
            count(*) FILTER (WHERE status = 'done')::int::text AS d FROM reports`,
  );
  return { new: Number(r?.n ?? 0), inProgress: Number(r?.p ?? 0), done: Number(r?.d ?? 0) };
}

// ---------- การกระทำของไอที ----------

export type ReportAction =
  | { action: "start" }
  | { action: "done" }
  | { action: "reopen" }
  | { action: "assign"; assignee: string }
  | { action: "note"; note: string }
  | { action: "item"; itemId: number; done: boolean };

export function parseReportAction(body: unknown): ReportAction | null {
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  switch (b?.action) {
    case "start":
    case "done":
    case "reopen":
      return { action: b.action };
    case "assign":
      return typeof b.assignee === "string" ? { action: "assign", assignee: clean(b.assignee, 80) } : null;
    case "note":
      return typeof b.note === "string" ? { action: "note", note: b.note.normalize("NFC").trim().slice(0, 2000) } : null;
    case "item":
      return typeof b.itemId === "number" && Number.isInteger(b.itemId) && typeof b.done === "boolean"
        ? { action: "item", itemId: b.itemId, done: b.done }
        : null;
    default:
      return null;
  }
}

async function logReportEvent(id: number, type: string, actor: string, detail: Record<string, unknown> = {}) {
  await q("INSERT INTO report_events (report_id, type, actor, detail) VALUES ($1, $2, $3, $4::jsonb)", [id, type, actor, JSON.stringify(detail)]);
}

/** ทำรายการแล้วคืนรายงานล่าสุด (null = ไม่พบ) */
export async function applyReportAction(id: number, a: ReportAction, actor: string): Promise<ReportDTO | null> {
  const cur = await getReport(id);
  if (!cur) return null;
  switch (a.action) {
    case "start":
      await q(
        `UPDATE reports SET status = 'in_progress', started_at = COALESCE(started_at, now()), done_at = NULL,
                assignee_name = CASE WHEN assignee_name = '' THEN $2 ELSE assignee_name END, updated_at = now() WHERE id = $1`,
        [id, actor],
      );
      await logReportEvent(id, "started", actor);
      break;
    case "done":
      await q("UPDATE report_items SET done = true, done_at = now(), done_by = $2 WHERE report_id = $1 AND done = false", [id, actor]);
      await q(
        `UPDATE reports SET status = 'done', done_at = now(), started_at = COALESCE(started_at, now()),
                assignee_name = CASE WHEN assignee_name = '' THEN $2 ELSE assignee_name END, updated_at = now() WHERE id = $1`,
        [id, actor],
      );
      await logReportEvent(id, "done", actor);
      break;
    case "reopen":
      await q("UPDATE reports SET status = 'in_progress', done_at = NULL, updated_at = now() WHERE id = $1", [id]);
      await logReportEvent(id, "reopened", actor);
      break;
    case "assign":
      await q("UPDATE reports SET assignee_name = $2, updated_at = now() WHERE id = $1", [id, a.assignee]);
      await logReportEvent(id, "assigned", actor, { to: a.assignee });
      break;
    case "note":
      await q("UPDATE reports SET note = $2, updated_at = now() WHERE id = $1", [id, a.note]);
      await logReportEvent(id, "note", actor);
      break;
    case "item": {
      const item = cur.items.find((i) => i.id === a.itemId);
      if (!item) return cur;
      await q("UPDATE report_items SET done = $3, done_at = CASE WHEN $3 THEN now() ELSE NULL END, done_by = CASE WHEN $3 THEN $4 ELSE '' END WHERE id = $2 AND report_id = $1", [
        id,
        a.itemId,
        a.done,
        actor,
      ]);
      await logReportEvent(id, a.done ? "item_done" : "item_undone", actor, { item: a.itemId, text: item.text });
      const items = cur.items.map((i) => (i.id === a.itemId ? { ...i, done: a.done } : i));
      const allDone = items.every((i) => i.done);
      if (allDone && cur.status !== "done") {
        // ติ๊กครบทุกข้อ → ปิดงานให้อัตโนมัติ (เหมือน Modal ปิดเคสในแชท)
        await q(
          `UPDATE reports SET status = 'done', done_at = now(), started_at = COALESCE(started_at, now()),
                  assignee_name = CASE WHEN assignee_name = '' THEN $2 ELSE assignee_name END, updated_at = now() WHERE id = $1`,
          [id, actor],
        );
        await logReportEvent(id, "done", actor, { auto: true });
      } else if (!allDone && cur.status === "done") {
        await q("UPDATE reports SET status = 'in_progress', done_at = NULL, updated_at = now() WHERE id = $1", [id]);
        await logReportEvent(id, "reopened", actor, { auto: true });
      } else if (!allDone && cur.status === "new") {
        await q(
          `UPDATE reports SET status = 'in_progress', started_at = COALESCE(started_at, now()),
                  assignee_name = CASE WHEN assignee_name = '' THEN $2 ELSE assignee_name END, updated_at = now() WHERE id = $1`,
          [id, actor],
        );
      }
      break;
    }
  }
  return getReport(id);
}
