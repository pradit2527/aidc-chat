// แจ้งเตือนเข้า "กลุ่ม WhatsApp" ของทีมไอทีเมื่อมีงานแจ้งปัญหาใหม่ (ผู้ใช้ต้องการให้เข้ากลุ่ม "IT support cosi")
// ส่งผ่าน "อุปกรณ์ที่เชื่อมต่อ" (waDevice.ts — หลักการเดียวกับ WhatsApp Web) เพราะ API ทางการของ WhatsApp/Twilio ส่งเข้ากลุ่มไม่ได้
// กลุ่มเป้าหมายอยู่ในตาราง app_settings (key 'whatsapp_group') ตั้งจากหน้า /admin/whatsapp — ผลการส่งแต่ละงานบันทึกใน report_events (type 'notified')
import { dbEnabled, q } from "./db";
import { getReport } from "./reports";
import { deviceEnabled, waDevice } from "./waDevice";
import { formatReportNotice, formatTestNotice } from "./whatsappNotice";

const GROUP_KEY = "whatsapp_group";

export type SendResult = {
  /** ชื่อกลุ่มปลายทาง (ไม่มีชื่อ → jid) */
  to: string;
  ok: boolean;
  /** sent | error | not_linked | not_configured */
  status: string;
  message: string;
};

export type GroupTarget = { jid: string; name: string };
export const isGroupJid = (v: unknown): v is string => typeof v === "string" && /^\d{5,32}(-\d{1,20})?@g\.us$/.test(v);

export async function getGroupTarget(): Promise<GroupTarget | null> {
  if (!dbEnabled) return null;
  const [row] = await q<{ value: { jid?: unknown; name?: unknown } | null }>("SELECT value FROM app_settings WHERE key = $1", [GROUP_KEY]);
  const v = row?.value;
  if (!v || !isGroupJid(v.jid)) return null;
  return { jid: v.jid, name: String(v.name ?? "").slice(0, 120) };
}

export async function setGroupTarget(t: GroupTarget | null): Promise<void> {
  await q(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [GROUP_KEY, JSON.stringify(t ? { jid: t.jid, name: t.name.slice(0, 120) } : {})],
  );
}

/** ส่งเข้ากลุ่มผ่านอุปกรณ์ที่เชื่อมต่อ — ไม่โยน error (คืนผลเป็น SendResult เสมอ) */
export async function sendToGroup(target: GroupTarget, text: string): Promise<SendResult> {
  const to = target.name || target.jid;
  if (!deviceEnabled()) return { to, ok: false, status: "not_configured", message: "WHATSAPP_DEVICE is off" };
  try {
    await waDevice().send(target.jid, text);
    return { to, ok: true, status: "sent", message: "" };
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return { to, ok: false, status: m === "not_linked" ? "not_linked" : "error", message: m };
  }
}

export const sendGroupTest = (target: GroupTarget) => sendToGroup(target, formatTestNotice());

/** ชื่อกลุ่มที่ระบบเลือกให้เองหลังเชื่อมต่อ (ผู้ใช้: "IT support cosi") — เปลี่ยนได้ด้วย WHATSAPP_GROUP_NAME */
export const groupName = () => (process.env.WHATSAPP_GROUP_NAME ?? "").trim() || "IT support cosi";
const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * กลุ่มที่บันทึกไว้ — ถ้ายังไม่มีและเชื่อมต่ออยู่ จะหา "IT support cosi" (ชื่อตรง หรือมีคำนี้อยู่) จากกลุ่มของเบอร์นั้นแล้วบันทึกให้เอง
 * → ผู้ใช้ทำแค่สแกน QR ครั้งเดียว ไม่ต้องเลือกกลุ่มเอง
 */
export async function resolveGroupTarget(): Promise<GroupTarget | null> {
  const saved = await getGroupTarget();
  if (saved) return saved;
  if (!dbEnabled || !deviceEnabled() || waDevice().getState().status !== "open") return null;
  const groups = await waDevice().listGroups().catch(() => []);
  const want = norm(groupName());
  const hit = groups.find((g) => norm(g.name) === want) ?? groups.find((g) => norm(g.name).includes(want));
  if (!hit) return null;
  const target = { jid: hit.jid, name: hit.name };
  await setGroupTarget(target);
  console.log(`[whatsapp] group auto-selected: ${hit.name}`);
  return target;
}

/**
 * เรียกหลังสร้างรายงานสำเร็จ (ใน after() — ไม่ถ่วงคำตอบของพนักงาน)
 * ยังไม่เปิดอุปกรณ์/ยังไม่เลือกกลุ่ม → ไม่ทำอะไร; ผลการส่งบันทึกใน report_events (type 'notified') ให้ดูได้ที่ /admin/whatsapp
 */
export async function notifyNewReport(reportId: number, baseUrl: string): Promise<SendResult | null> {
  if (!dbEnabled || !deviceEnabled()) return null;
  const group = await resolveGroupTarget();
  if (!group) return null;
  const r = await getReport(reportId);
  if (!r) return null;
  // ลิงก์ใช้เลขตั๋ว (ผู้ใช้สั่ง) — กดแล้วถ้ายังไม่ล็อกอินจะไปหน้าล็อกอินแล้วเด้งกลับมาเปิดตั๋วนี้
  const link = `${baseUrl.replace(/\/+$/, "")}/admin/reports/${encodeURIComponent(r.ticketNo)}`;
  const result = await sendToGroup(group, formatReportNotice(r, link));
  if (!result.ok) console.warn(`[whatsapp] ${r.ticketNo} → ${result.to}: ${result.status} ${result.message}`);
  await q("INSERT INTO report_events (report_id, type, actor, detail) VALUES ($1, 'notified', 'system', $2::jsonb)", [
    r.id,
    JSON.stringify({ channel: "whatsapp", results: [result] }),
  ]).catch((e: unknown) => console.error(`[whatsapp] log: ${e instanceof Error ? e.message : String(e)}`));
  return result;
}

export type NotifyLog = { id: number; reportId: number; ticketNo: string; at: number; results: SendResult[] };

/** การแจ้งเตือนล่าสุด (จาก report_events) — ใหม่ก่อน */
export async function recentNotifications(limit = 20): Promise<NotifyLog[]> {
  if (!dbEnabled) return [];
  const rows = await q<{ id: string; report_id: string; ticket_no: string; at: number; detail: { results?: Partial<SendResult>[] } | null }>(
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
    results: (Array.isArray(x.detail?.results) ? x.detail.results : []).map((s) => ({
      to: String(s.to ?? ""),
      ok: s.ok === true,
      status: String(s.status ?? ""),
      message: String(s.message ?? ""),
    })),
  }));
}

/** ฐาน URL สำหรับลิงก์ในข้อความ: PORTAL_PUBLIC_URL (เช่น http://10.0.100.54:3400) ไม่มีก็ใช้ origin ของคำขอ */
export function publicBaseUrl(req: Request): string {
  return (process.env.PORTAL_PUBLIC_URL ?? "").trim().replace(/\/+$/, "") || new URL(req.url).origin;
}
