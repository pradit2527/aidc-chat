// รายละเอียดเคสสำหรับหัวหน้า (อ่านอย่างเดียว) — แชท: ข้อมูลทะเบียน + ประวัติเหตุการณ์ + ข้อความ (ถ้าตั้ง CHATWOOT_AGENT_TOKEN)
// แจ้งปัญหา: ข้อย่อย + ไฟล์แนบ + ประวัติ · ไม่ส่ง "บันทึกภายในของไอที" และ "โน้ตส่วนตัว" ใน Chatwoot ให้หัวหน้า
import type { MessageDTO } from "./adminTypes";
import { agentToken } from "./chatwoot";
import { acct, cw, payloadArray, toMessage } from "./cw";
import { q } from "./db";
import { getReport, type ReportItemDTO } from "./reports";
import type { Session } from "./session";
import type { ReportFileDTO } from "./uploadRules";
import type { Bucket, Kind } from "./dashboard";

export type CaseEvent = { type: string; actor: string; at: number; topics: string[] };

export type CaseDetail = {
  kind: Kind;
  id: number;
  ticketNo: string;
  name: string;
  department: string;
  contact: string;
  urgent: boolean;
  status: Bucket;
  rawStatus: string;
  assignee: string;
  createdAt: number;
  firstResponseAt: number | null;
  doneAt: number | null;
  topics: string[];
  closedTopics: string[];
  items: ReportItemDTO[];
  files: ReportFileDTO[];
  events: CaseEvent[];
  /** ข้อความแชท (เฉพาะแชท): null = อ่านไม่ได้ ดู messagesState */
  messages: MessageDTO[] | null;
  messagesState: "ok" | "no_token" | "error" | "none";
};

const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
const topicsOf = (d: unknown): string[] => {
  const t = (d as { topics?: unknown; labels?: unknown } | null)?.topics ?? (d as { labels?: unknown } | null)?.labels;
  return Array.isArray(t) ? t.filter((x): x is string => typeof x === "string") : [];
};

export async function getCaseDetail(kind: Kind, id: number): Promise<CaseDetail | null> {
  return kind === "report" ? reportDetail(id) : chatDetail(id);
}

async function reportDetail(id: number): Promise<CaseDetail | null> {
  const r = await getReport(id);
  if (!r) return null;
  const ev = await q<Record<string, unknown>>(
    "SELECT type, actor, detail, extract(epoch FROM created_at)::bigint::text AS at FROM report_events WHERE report_id = $1 ORDER BY id",
    [id],
  );
  const topics = [...new Set(r.items.map((i) => `cosi-${i.topic}`))];
  return {
    kind: "report",
    id,
    ticketNo: r.ticketNo,
    name: r.name,
    department: r.department,
    contact: r.contact,
    urgent: r.urgent,
    status: r.status,
    rawStatus: r.status,
    assignee: r.assignee,
    createdAt: r.createdAt,
    firstResponseAt: r.startedAt,
    doneAt: r.doneAt,
    topics,
    closedTopics: [],
    items: r.items,
    files: r.files,
    events: ev.map((e) => ({ type: String(e.type), actor: String(e.actor ?? ""), at: Number(e.at) || 0, topics: topicsOf(e.detail) })),
    messages: null,
    messagesState: "none",
  };
}

async function chatDetail(id: number): Promise<CaseDetail | null> {
  const [t] = await q<Record<string, unknown>>(
    `SELECT ticket_no, contact_name, department, labels, closed_topics, urgent, status, assignee_name,
            extract(epoch FROM created_at)::bigint::text AS created,
            extract(epoch FROM first_reply_at)::bigint::text AS first_at,
            extract(epoch FROM resolved_at)::bigint::text AS done
       FROM tickets WHERE conversation_id = $1`,
    [id],
  );
  if (!t) return null;
  const ev = await q<Record<string, unknown>>(
    "SELECT type, actor, detail, extract(epoch FROM created_at)::bigint::text AS at FROM ticket_events WHERE conversation_id = $1 ORDER BY id",
    [id],
  );
  const status = String(t.status);
  const assignee = String(t.assignee_name ?? "");
  const [dept, ...rest] = String(t.department ?? "").split(" · ");
  const { messages, state } = await chatMessages(id);
  return {
    kind: "chat",
    id,
    ticketNo: String(t.ticket_no),
    name: String(t.contact_name ?? ""),
    department: dept ?? "",
    contact: rest.join(" · "),
    urgent: t.urgent === true,
    status: status === "resolved" ? "done" : status === "open" && !assignee ? "new" : "in_progress",
    rawStatus: status,
    assignee,
    createdAt: Number(t.created) || 0,
    firstResponseAt: num(t.first_at),
    doneAt: num(t.done),
    topics: Array.isArray(t.labels) ? (t.labels as string[]) : [],
    closedTopics: Array.isArray(t.closed_topics) ? (t.closed_topics as string[]) : [],
    items: [],
    files: [],
    events: ev.map((e) => ({ type: String(e.type), actor: String(e.actor ?? ""), at: Number(e.at) || 0, topics: topicsOf(e.detail) })),
    messages,
    messagesState: state,
  };
}

/** ข้อความแชทจาก Chatwoot ผ่าน agent กลาง (สูงสุด ~80 ข้อความล่าสุด) — ตัดโน้ตส่วนตัวและข้อความระบบออก */
async function chatMessages(id: number): Promise<{ messages: MessageDTO[] | null; state: CaseDetail["messagesState"] }> {
  if (!agentToken()) return { messages: null, state: "no_token" };
  const s: Session = { token: "", client: "", uid: "", user: { id: 0, name: "manager", email: "" }, local: true, exp: Date.now() + 60_000 };
  try {
    const all: MessageDTO[] = [];
    let before = 0;
    for (let page = 0; page < 4; page++) {
      const body = await cw<unknown>(s, acct(`/conversations/${id}/messages${before ? `?before=${before}` : ""}`));
      const batch = payloadArray(body).map(toMessage).filter((m) => m.id > 0);
      if (batch.length === 0) break;
      all.push(...batch);
      before = Math.min(...batch.map((m) => m.id));
      if (batch.length < 20) break;
    }
    const seen = new Set<number>();
    const messages = all
      .filter((m) => !m.private && m.kind !== "activity" && !seen.has(m.id) && seen.add(m.id))
      .sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
    return { messages, state: "ok" };
  } catch (e) {
    console.error(`[manager] messages #${id}: ${e instanceof Error ? e.message : String(e)}`);
    return { messages: null, state: "error" };
  }
}
