// ฝั่งเซิร์ฟเวอร์เท่านั้น — ตัวเรียก Chatwoot Application API ด้วย token ของผู้ใช้ที่ล็อกอิน
import type {
  AgentDTO,
  AttachmentDTO,
  CannedDTO,
  ConversationDTO,
  ConvStatus,
  MessageDTO,
} from "./adminTypes";
import { agentToken, chatwootConfig } from "./chatwoot";
import type { Session } from "./session";

export const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || "1";
export const INBOX_ID = process.env.CHATWOOT_INBOX_ID || "5";

export class CwError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const acct = (path: string) => `/api/v1/accounts/${ACCOUNT_ID}${path}`;

export async function cw<T>(s: Session, path: string, init: { method?: string; json?: unknown } = {}): Promise<T> {
  // แอดมินบัญชีในระบบเอง: ใช้ token ของ agent กลาง (CHATWOOT_AGENT_TOKEN); ไม่ได้ตั้ง → ใช้แชทไม่ได้
  const central = s.local ? agentToken() : "";
  if (s.local && !central) throw new CwError(403, "chatwoot agent token not configured");
  const { baseUrl } = chatwootConfig();
  let res: Response;
  try {
    res = await fetch(baseUrl + path, {
      method: init.method ?? (init.json !== undefined ? "POST" : "GET"),
      headers: {
        ...(s.local ? { api_access_token: central } : { "access-token": s.token, client: s.client, uid: s.uid }),
        accept: "application/json",
        ...(init.json !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new CwError(502, "chatwoot unreachable");
  }
  if (!res.ok) throw new CwError(res.status, `chatwoot ${res.status}`);
  if (res.status === 204) return {} as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// ---- แปลงข้อมูลดิบ → DTO (ป้องกันฟิลด์ที่อาจไม่มี) ----

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function previewOf(m: Raw): string {
  const text = str(m.content).replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);
  return arr(m.attachments).length ? "📎" : "";
}

export function toConversation(raw: unknown): ConversationDTO {
  const c = obj(raw);
  const meta = obj(c.meta);
  const sender = obj(meta.sender);
  const add = obj(sender.additional_attributes);
  const messages = arr(c.messages).map(obj);
  const last = obj(c.last_non_activity_message ?? messages[messages.length - 1]);
  const assignee = obj(meta.assignee);
  const rawStatus = str(c.status);
  const status: ConvStatus = (["open", "resolved", "pending", "snoozed"] as const).find((s) => s === rawStatus) ?? "open";
  const kind = last.message_type;
  const fromContact = kind === 0 || kind === "incoming";
  // ตัวเลขแจ้งเตือน (แดง) = "เคสเปิดอยู่และลูกค้ารอการตอบกลับ" เท่านั้น (ผู้ใช้กำหนด)
  //   - เคสที่ปิดแล้ว (resolved) → 0 เสมอ แม้ Chatwoot ยังนับ unread_count ค้างอยู่
  //   - ข้อความล่าสุดเป็นของเจ้าหน้าที่/บอท → 0 (ตอบไปแล้ว ไม่ต้องเตือน)
  //   - ข้อความล่าสุดเป็นของลูกค้า → อย่างน้อย 1 แม้ unread_count = 0 (Chatwoot รีเซ็ตเมื่อใครเปิดดูที่ไหนก็ตาม)
  const awaitingReply = fromContact && status === "open";
  // หัวข้อที่ปิดแล้ว เก็บเป็น custom attribute `closed_topics` (ข้อความคั่นด้วยจุลภาค)
  const closedRaw = str(obj(c.custom_attributes).closed_topics);
  const closedTopics = closedRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: num(c.id),
    status,
    unread: awaitingReply ? Math.max(num(c.unread_count), 1) : 0,
    updatedAt: num(c.timestamp) || num(last.created_at) || num(c.created_at),
    createdAt: num(c.created_at) || num(c.timestamp) || num(last.created_at),
    ticket: null,
    name: str(sender.name) || "—",
    subtitle: str(add.description) || str(add.company_name),
    preview: previewOf(last),
    previewFromContact: fromContact,
    labels: arr(c.labels).filter((l): l is string => typeof l === "string"),
    closedTopics,
    autoGreetedAt: Math.floor(Date.parse(str(obj(c.custom_attributes).auto_greeted_at)) / 1000) || 0,
    assignee: num(assignee.id) ? { id: num(assignee.id), name: str(assignee.name) } : null,
  };
}

export function toMessage(raw: unknown): MessageDTO {
  const m = obj(raw);
  const t = m.message_type;
  const kind: MessageDTO["kind"] =
    t === 0 || t === "incoming" ? "incoming" : t === 2 || t === "activity" ? "activity" : "outgoing";
  const attachments: AttachmentDTO[] = arr(m.attachments).map((a) => {
    const x = obj(a);
    const url = str(x.data_url);
    return {
      id: num(x.id),
      type: str(x.file_type) || "file",
      url,
      thumb: str(x.thumb_url) || url,
      name: decodeURIComponent(url.split("/").pop()?.split("?")[0] || "file"),
    };
  });
  return {
    id: num(m.id),
    createdAt: num(m.created_at),
    kind,
    content: str(m.content),
    private: m.private === true,
    // ข้อความขาออกที่ไม่มีผู้ส่ง = ข้อความอัตโนมัติของ Chatwoot (ต้อนรับ/บอท) → แสดงเป็น "Bot" แทน "คุณ"
    senderName: str(obj(m.sender).name) || (kind === "outgoing" && !m.sender ? "Bot" : ""),
    attachments,
  };
}

export const toCanned = (raw: unknown): CannedDTO => {
  const c = obj(raw);
  return { id: num(c.id), shortCode: str(c.short_code), content: str(c.content) };
};

export const toAgent = (raw: unknown): AgentDTO => {
  const a = obj(raw);
  return { id: num(a.id), name: str(a.name) };
};

/** Chatwoot ห่อผลลัพธ์ไม่เหมือนกันทุก endpoint — ดึง array ออกมาให้ได้ทุกแบบ */
export function payloadArray(body: unknown): unknown[] {
  const b = obj(body);
  if (Array.isArray(body)) return body;
  if (Array.isArray(b.payload)) return b.payload;
  const data = obj(b.data);
  if (Array.isArray(data.payload)) return data.payload;
  if (Array.isArray(b.data)) return b.data;
  return [];
}
