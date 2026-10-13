// ทะเบียน Ticket ใน Neon — ลงทะเบียนเคสจาก Chatwoot, ออกเลขตั๋วถาวร (001 ใหม่ทุกวัน), ซิงก์สถานะ, บันทึกเหตุการณ์
// ข้อความแชทไม่ได้เก็บที่นี่ (ยังอยู่ใน Chatwoot) — เก็บเฉพาะข้อมูลสำหรับติดตาม/รายงาน
import type { ConversationDTO } from "./adminTypes";
import { URGENT_LABEL } from "./categories";
import { db, dbEnabled, q } from "./db";
import { formatTicket, ticketDate } from "./tickets";

type Row = {
  conversation_id: string;
  ticket_no: string;
  status: string;
  labels: string[] | null;
  closed_topics: string[] | null;
  assignee_name: string;
  last_activity: string;
};

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

/** ลงทะเบียน/ซิงก์เคสทั้งชุด แล้วคืน map conversation_id → ticket_no (ว่างถ้าไม่ได้เปิดใช้ DB); actor = ชื่อผู้ทำ (ใส่ในเหตุการณ์) */
export async function registerTickets(convs: ConversationDTO[], actor = ""): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  if (!dbEnabled || convs.length === 0) return out;
  const rows = await q<Row>(
    `SELECT conversation_id::text, ticket_no, status, labels, closed_topics, assignee_name,
            extract(epoch from last_activity_at)::bigint::text AS last_activity
       FROM tickets WHERE conversation_id = ANY($1::bigint[])`,
    [convs.map((c) => c.id)],
  );
  const known = new Map(rows.map((r) => [Number(r.conversation_id), r]));
  // เคสใหม่: ออกเลขตามลำดับเวลาสร้าง (เก่าก่อน) เพื่อให้ 001 = เคสแรกของวัน
  const fresh = convs
    .filter((c) => !known.has(c.id))
    .sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
  for (const c of fresh) out.set(c.id, await allocate(c));
  for (const c of convs) {
    const r = known.get(c.id);
    if (!r) continue;
    out.set(c.id, r.ticket_no);
    await syncRow(c, r, actor);
  }
  return out;
}

/** id ของเคสที่ยังไม่อยู่ในทะเบียน (ใช้ตัดสินว่าต้องดึงเคสทั้งวันมาลงทะเบียนพร้อมกันหรือไม่) */
export async function unregisteredIds(ids: number[]): Promise<number[]> {
  if (!dbEnabled || ids.length === 0) return [];
  const rows = await q<{ conversation_id: string }>(
    "SELECT conversation_id::text FROM tickets WHERE conversation_id = ANY($1::bigint[])",
    [ids],
  );
  const known = new Set(rows.map((r) => Number(r.conversation_id)));
  return ids.filter((id) => !known.has(id));
}

/** ซิงก์เคสเดียวทันทีหลังคอนโซลเปลี่ยนสถานะ/มอบหมาย — ไม่โยน error (ทะเบียนเป็นงานเสริม ไม่ขัดขวางงานหลัก) */
export async function syncTicket(c: ConversationDTO, actor: string): Promise<void> {
  if (!dbEnabled) return;
  try {
    await registerTickets([c], actor);
  } catch (e) {
    console.error(`[db] sync #${c.id}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** เลขตั๋วของเคสเดียว (ลงทะเบียนให้ถ้ายังไม่มี) */
export async function ticketNoOf(c: ConversationDTO): Promise<string | null> {
  if (!dbEnabled) return null;
  return (await registerTickets([c])).get(c.id) ?? null;
}

/** ออกเลขตั๋วใหม่แบบ atomic: ล็อกต่อวันด้วย advisory lock → เพิ่มตัวนับ → บันทึกเคส + เหตุการณ์ created */
async function allocate(c: ConversationDTO): Promise<string> {
  const day = ticketDate(c.createdAt);
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`ticket-day:${day}`]);
    const ex = await client.query("SELECT ticket_no FROM tickets WHERE conversation_id = $1", [c.id]);
    if (ex.rows[0]) {
      await client.query("COMMIT");
      return String(ex.rows[0].ticket_no);
    }
    const seqRes = await client.query(
      `INSERT INTO ticket_counters (day, seq) VALUES ($1, 1)
       ON CONFLICT (day) DO UPDATE SET seq = ticket_counters.seq + 1
       RETURNING seq`,
      [day],
    );
    const seq = Number(seqRes.rows[0].seq);
    const no = formatTicket(day, seq);
    await client.query(
      `INSERT INTO tickets (conversation_id, ticket_no, ticket_day, seq, contact_name, department, labels, closed_topics,
                            urgent, status, assignee_name, created_at, resolved_at, last_activity_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp($12), $13, to_timestamp($14))`,
      [
        c.id,
        no,
        day,
        seq,
        c.name,
        c.subtitle,
        c.labels,
        c.closedTopics,
        c.labels.includes(URGENT_LABEL),
        c.status,
        c.assignee?.name ?? "",
        c.createdAt,
        c.status === "resolved" ? new Date(c.updatedAt * 1000) : null,
        c.updatedAt,
      ],
    );
    await client.query(
      "INSERT INTO ticket_events (conversation_id, ticket_no, type, detail) VALUES ($1, $2, 'created', $3::jsonb)",
      [c.id, no, JSON.stringify({ labels: c.labels, name: c.name, status: c.status })],
    );
    await client.query("COMMIT");
    return no;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** ซิงก์ฟิลด์ที่เปลี่ยนได้จาก Chatwoot และบันทึกเหตุการณ์ resolved / reopened / assigned */
async function syncRow(c: ConversationDTO, r: Row, actor: string): Promise<void> {
  const assignee = c.assignee?.name ?? "";
  const statusChanged = r.status !== c.status;
  const assigneeChanged = r.assignee_name !== assignee;
  const labelsChanged =
    !sameList(r.labels ?? [], c.labels) || !sameList(r.closed_topics ?? [], c.closedTopics);
  const activityChanged = Number(r.last_activity) !== c.updatedAt;
  if (!statusChanged && !assigneeChanged && !labelsChanged && !activityChanged) return;
  await q(
    `UPDATE tickets
        SET status = $2, assignee_name = $3, labels = $4, closed_topics = $5, urgent = $6,
            contact_name = $7, department = $8, last_activity_at = to_timestamp($9),
            resolved_at = CASE WHEN $2 = 'resolved' THEN COALESCE(resolved_at, now()) ELSE NULL END,
            updated_at = now()
      WHERE conversation_id = $1`,
    [
      c.id,
      c.status,
      assignee,
      c.labels,
      c.closedTopics,
      c.labels.includes(URGENT_LABEL),
      c.name,
      c.subtitle,
      c.updatedAt,
    ],
  );
  if (statusChanged) {
    const type =
      c.status === "resolved" ? "resolved" : r.status === "resolved" && c.status === "open" ? "reopened" : "status";
    await logEvent(c.id, type, actor, { from: r.status, to: c.status });
  }
  if (assigneeChanged && assignee) await logEvent(c.id, "assigned", actor, { to: assignee });
}

/** บันทึกเหตุการณ์ของเคส (ไม่ทำอะไรถ้าไม่ได้เปิดใช้ DB; ล้มเหลวแค่ log ไม่ขัดขวางงานหลัก) */
export async function logEvent(
  conversationId: number,
  type: string,
  actor: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  if (!dbEnabled) return;
  try {
    await q(
      `INSERT INTO ticket_events (conversation_id, ticket_no, type, actor, detail)
       VALUES ($1, (SELECT ticket_no FROM tickets WHERE conversation_id = $1), $2, $3, $4::jsonb)`,
      [conversationId, type, actor, JSON.stringify(detail)],
    );
  } catch (e) {
    console.error(`[db] event ${type} #${conversationId}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** เวลาที่เจ้าหน้าที่ตอบครั้งแรก (ใช้คำนวณเวลาตอบสนองเฉลี่ย) */
export async function markFirstReply(conversationId: number): Promise<void> {
  if (!dbEnabled) return;
  try {
    await q("UPDATE tickets SET first_reply_at = COALESCE(first_reply_at, now()) WHERE conversation_id = $1", [
      conversationId,
    ]);
  } catch (e) {
    console.error(`[db] first_reply #${conversationId}: ${e instanceof Error ? e.message : String(e)}`);
  }
}
