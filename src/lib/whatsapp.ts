// แจ้งเตือน WhatsApp หาทีมไอทีเมื่อมีงานแจ้งปัญหาใหม่ — 2 ช่องทาง
//   1) กลุ่ม WhatsApp ผ่าน "อุปกรณ์ที่เชื่อมต่อ" (waDevice.ts, เปิดด้วย WHATSAPP_DEVICE=1) — ช่องทางหลัก (ผู้ใช้ต้องการให้เข้ากลุ่ม "IT support cosi")
//   2) เบอร์โดยตรงผ่าน Twilio WhatsApp API (ช่องทางเสริม — Twilio ส่งเข้ากลุ่มไม่ได้)
// คีย์ Twilio อยู่ใน env ฝั่งเซิร์ฟเวอร์เท่านั้น: TWILIO_ACCOUNT_SID + (TWILIO_API_KEY_SID/TWILIO_API_KEY_SECRET | TWILIO_AUTH_TOKEN), TWILIO_WHATSAPP_FROM
// ค่าตั้ง (กลุ่มเป้าหมาย, เบอร์ผู้รับ) อยู่ในตาราง app_settings — ผลการส่งแต่ละงานบันทึกใน report_events (type 'notified')
import { dbEnabled, q } from "./db";
import { normalizePhone } from "./phone";
import { getReport } from "./reports";
import { deviceEnabled, waDevice } from "./waDevice";
import { formatReportNotice, formatTestNotice } from "./whatsappNotice";

export { normalizePhone } from "./phone";

export const SANDBOX_FROM = "whatsapp:+14155238886";
const TWILIO_API = "https://api.twilio.com/2010-04-01";
const RECIPIENTS_KEY = "whatsapp_recipients";
const GROUP_KEY = "whatsapp_group";

export type Channel = "group" | "twilio";

export type SendResult = {
  channel: Channel;
  /** ปลายทาง: ชื่อกลุ่ม หรือเบอร์ (+…) */
  to: string;
  /** ยังไม่พบความล้มเหลว (Twilio: สถานะอาจยังไม่สุดท้าย) */
  ok: boolean;
  /** Message SID ของ Twilio (กลุ่ม/ปฏิเสธ = null) */
  sid: string | null;
  /** sent | queued | sending | delivered | read | failed | undelivered | rejected | error | not_configured | not_linked */
  status: string;
  /** รหัสข้อผิดพลาดของ Twilio เช่น 63016 (นอกช่วง 24 ชม.), 20003 (คีย์ไม่ถูกต้อง) */
  code: number | null;
  message: string;
};

// ---------- ค่าตั้งใน app_settings ----------

async function getSetting<T>(key: string): Promise<T | null> {
  if (!dbEnabled) return null;
  const [row] = await q<{ value: T }>("SELECT value FROM app_settings WHERE key = $1", [key]);
  return row ? row.value : null;
}

async function setSetting(key: string, value: unknown): Promise<void> {
  await q(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}

// ---------- กลุ่ม (อุปกรณ์ที่เชื่อมต่อ) ----------

export type GroupTarget = { jid: string; name: string };
export const isGroupJid = (v: unknown): v is string => typeof v === "string" && /^\d{5,32}(-\d{1,20})?@g\.us$/.test(v);

export async function getGroupTarget(): Promise<GroupTarget | null> {
  const v = await getSetting<{ jid?: unknown; name?: unknown }>(GROUP_KEY);
  if (!v || !isGroupJid(v.jid)) return null;
  return { jid: v.jid, name: String(v.name ?? "").slice(0, 120) };
}

export async function setGroupTarget(t: GroupTarget | null): Promise<void> {
  await setSetting(GROUP_KEY, t ? { jid: t.jid, name: t.name.slice(0, 120) } : {});
}

/** ส่งเข้ากลุ่มผ่านอุปกรณ์ที่เชื่อมต่อ — ไม่โยน error (คืนผลเป็น SendResult เสมอ) */
export async function sendToGroup(target: GroupTarget, text: string): Promise<SendResult> {
  const base = { channel: "group" as const, to: target.name || target.jid, sid: null, code: null };
  if (!deviceEnabled()) return { ...base, ok: false, status: "not_configured", message: "WHATSAPP_DEVICE is off" };
  try {
    await waDevice().send(target.jid, text);
    return { ...base, ok: true, status: "sent", message: "" };
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return { ...base, ok: false, status: m === "not_linked" ? "not_linked" : "error", message: m };
  }
}

export const sendGroupTest = (target: GroupTarget) => sendToGroup(target, formatTestNotice());

// ---------- Twilio (เบอร์โดยตรง) ----------

export type WaStatus = {
  /** มีคีย์ครบ (ยังไม่ได้ตรวจกับ Twilio ว่าใช้ได้) */
  configured: boolean;
  /** เบอร์ผู้ส่งในรูป whatsapp:+… (ไม่ใช่ความลับ) */
  from: string;
  /** ผู้ส่งคือ Sandbox ของ Twilio (ข้อจำกัด: join ก่อน + ช่วง 24 ชม.) */
  sandbox: boolean;
  /** ชื่อตัวแปร env ที่ยังขาด */
  missing: string[];
};

function creds() {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID ?? "").trim();
  const keySid = (process.env.TWILIO_API_KEY_SID ?? "").trim();
  const keySecret = (process.env.TWILIO_API_KEY_SECRET ?? "").trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN ?? "").trim();
  const rawFrom = (process.env.TWILIO_WHATSAPP_FROM ?? "").trim() || SANDBOX_FROM;
  const from = rawFrom.startsWith("whatsapp:") ? rawFrom : `whatsapp:${rawFrom}`;
  // API Key ใช้ key SID เป็น username + secret เป็น password; Auth Token ใช้ account SID + token
  const user = keySid && keySecret ? keySid : accountSid;
  const pass = keySid && keySecret ? keySecret : authToken;
  return { accountSid, from, user, pass };
}

export function whatsappStatus(): WaStatus {
  const c = creds();
  const missing: string[] = [];
  if (!/^AC[0-9a-f]{32}$/i.test(c.accountSid)) missing.push("TWILIO_ACCOUNT_SID");
  if (!c.pass) missing.push("TWILIO_API_KEY_SID/TWILIO_API_KEY_SECRET");
  return { configured: missing.length === 0, from: c.from, sandbox: c.from === SANDBOX_FROM, missing };
}

const authHeader = () => {
  const c = creds();
  return "Basic " + Buffer.from(`${c.user}:${c.pass}`).toString("base64");
};

export type Recipient = { phone: string; label: string };

/** อ่านรายชื่อผู้รับจากค่าที่เก็บ (ข้ามแถวที่เบอร์ไม่ถูกต้อง, ไม่เอาเบอร์ซ้ำ) */
export function parseRecipients(v: unknown): Recipient[] {
  if (!Array.isArray(v)) return [];
  const out: Recipient[] = [];
  for (const x of v) {
    if (!x || typeof x !== "object") continue;
    const phone = normalizePhone((x as { phone?: unknown }).phone);
    if (!phone || out.some((o) => o.phone === phone)) continue;
    const label = String((x as { label?: unknown }).label ?? "").normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 60);
    out.push({ phone, label });
  }
  return out;
}

export async function listRecipients(): Promise<Recipient[]> {
  return parseRecipients(await getSetting(RECIPIENTS_KEY));
}

export async function saveRecipients(list: Recipient[]): Promise<void> {
  await setSetting(RECIPIENTS_KEY, parseRecipients(list));
}

type TwilioMsg = { sid?: string; status?: string; error_code?: number | null; error_message?: string | null; code?: number; message?: string };

const FINAL = new Set(["delivered", "read", "failed", "undelivered"]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** ส่งข้อความ 1 เบอร์ — Twilio รับคำขอแล้วจะคืน queued (ความล้มเหลวจริง เช่น 63016 จะมาทีหลัง → ดู refreshStatus) */
export async function sendWhatsApp(phone: string, body: string): Promise<SendResult> {
  const s = whatsappStatus();
  const base = { channel: "twilio" as const, to: phone };
  if (!s.configured) return { ...base, ok: false, sid: null, status: "not_configured", code: null, message: `missing ${s.missing.join(", ")}` };
  const c = creds();
  try {
    const res = await fetch(`${TWILIO_API}/Accounts/${c.accountSid}/Messages.json`, {
      method: "POST",
      headers: { authorization: authHeader(), "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({ From: c.from, To: `whatsapp:${phone}`, Body: body }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const j = (await res.json().catch(() => ({}))) as TwilioMsg;
    if (!res.ok || !j.sid) {
      return { ...base, ok: false, sid: j.sid ?? null, status: "rejected", code: j.code ?? j.error_code ?? res.status, message: j.message ?? j.error_message ?? `HTTP ${res.status}` };
    }
    return { ...base, ok: true, sid: j.sid, status: j.status ?? "queued", code: j.error_code ?? null, message: j.error_message ?? "" };
  } catch (e) {
    return { ...base, ok: false, sid: null, status: "error", code: null, message: e instanceof Error ? e.message : String(e) };
  }
}

/** ถามสถานะล่าสุดของข้อความจาก Twilio (ถามไม่ได้ → คืนค่าเดิม) */
export async function refreshStatus(r: SendResult): Promise<SendResult> {
  if (!r.sid) return r;
  const c = creds();
  try {
    const res = await fetch(`${TWILIO_API}/Accounts/${c.accountSid}/Messages/${r.sid}.json`, {
      headers: { authorization: authHeader(), accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return r;
    const j = (await res.json().catch(() => ({}))) as TwilioMsg;
    const status = j.status ?? r.status;
    const failed = status === "failed" || status === "undelivered";
    return { ...r, ok: !failed, status, code: j.error_code ?? null, message: j.error_message ?? "" };
  } catch {
    return r;
  }
}

/** ส่งแล้วรอสถานะสุดท้ายสั้น ๆ (tries × waitMs) เพื่อให้หน้าแอดมิน/บันทึกเห็นผลจริง เช่น failed 63016 */
export async function sendAndWait(phone: string, body: string, opts: { tries?: number; waitMs?: number } = {}): Promise<SendResult> {
  const { tries = 3, waitMs = 2000 } = opts;
  let r = await sendWhatsApp(phone, body);
  for (let i = 0; i < tries && r.sid && !FINAL.has(r.status); i++) {
    await sleep(waitMs);
    r = await refreshStatus(r);
  }
  return r;
}

export async function sendTest(phones: string[]): Promise<SendResult[]> {
  const body = formatTestNotice();
  return Promise.all(phones.map((p) => sendAndWait(p, body)));
}

// ---------- แจ้งงานใหม่ (ทุกช่องทางที่พร้อม) ----------

/**
 * เรียกหลังสร้างรายงานสำเร็จ (ใน after() — ไม่ถ่วงคำตอบของพนักงาน)
 * ส่งเข้ากลุ่ม (ถ้าเปิดอุปกรณ์และเลือกกลุ่มแล้ว) และ/หรือเบอร์ Twilio (ถ้าตั้งค่าและมีผู้รับ); ไม่มีช่องทางใดพร้อม → ไม่ทำอะไร
 * ผลการส่งบันทึกใน report_events (type 'notified') ให้ดูได้ที่ /admin/whatsapp
 */
export async function notifyNewReport(reportId: number, baseUrl: string): Promise<SendResult[]> {
  if (!dbEnabled) return [];
  const [group, recipients] = await Promise.all([deviceEnabled() ? getGroupTarget() : null, whatsappStatus().configured ? listRecipients() : []]);
  if (!group && recipients.length === 0) return [];
  const r = await getReport(reportId);
  if (!r) return [];
  const link = `${baseUrl.replace(/\/+$/, "")}/admin/reports?r=${r.id}`;
  const body = formatReportNotice(r, link);
  const results = await Promise.all([
    ...(group ? [sendToGroup(group, body)] : []),
    ...recipients.map((x) => sendAndWait(x.phone, body, { tries: 2, waitMs: 3000 })),
  ]);
  for (const x of results) if (!x.ok) console.warn(`[whatsapp] ${r.ticketNo} → ${x.channel}:${x.to}: ${x.status} ${x.code ?? ""} ${x.message}`);
  await q("INSERT INTO report_events (report_id, type, actor, detail) VALUES ($1, 'notified', 'system', $2::jsonb)", [
    r.id,
    JSON.stringify({ channel: "whatsapp", results }),
  ]).catch((e: unknown) => console.error(`[whatsapp] log: ${e instanceof Error ? e.message : String(e)}`));
  return results;
}

export type NotifyLog = { id: number; reportId: number; ticketNo: string; at: number; results: SendResult[] };

/** การแจ้งเตือนล่าสุด (จาก report_events) — ใหม่ก่อน */
export async function recentNotifications(limit = 20): Promise<NotifyLog[]> {
  if (!dbEnabled) return [];
  const rows = await q<{ id: string; report_id: string; ticket_no: string; at: number; detail: { results?: SendResult[] } | null }>(
    `SELECT e.id::text AS id, e.report_id::text AS report_id, r.ticket_no, floor(extract(epoch from e.created_at))::int AS at, e.detail
       FROM report_events e JOIN reports r ON r.id = e.report_id
      WHERE e.type = 'notified' ORDER BY e.id DESC LIMIT $1`,
    [limit],
  );
  return rows.map((x) => ({
    id: Number(x.id),
    reportId: Number(x.report_id),
    ticketNo: x.ticket_no,
    at: Number(x.at),
    // แถวเก่าก่อนมีช่องทางกลุ่มไม่มี channel → ถือเป็น Twilio
    results: (Array.isArray(x.detail?.results) ? x.detail.results : []).map((s) => ({ ...s, channel: s.channel ?? "twilio" })),
  }));
}

/** ฐาน URL สำหรับลิงก์ในข้อความ: PORTAL_PUBLIC_URL (เช่น http://10.0.100.54:3400) ไม่มีก็ใช้ origin ของคำขอ */
export function publicBaseUrl(req: Request): string {
  return (process.env.PORTAL_PUBLIC_URL ?? "").trim().replace(/\/+$/, "") || new URL(req.url).origin;
}
