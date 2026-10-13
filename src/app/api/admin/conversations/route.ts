import { after } from "next/server";
import { adminRoute } from "@/lib/adminApi";
import type { ConversationDTO } from "@/lib/adminTypes";
import { acct, cw, INBOX_ID, payloadArray, toConversation } from "@/lib/cw";
import { dbEnabled } from "@/lib/db";
import { runGreetings } from "@/lib/greeter";
import type { Session } from "@/lib/session";
import { fetchConversationsSince, ticketMap } from "@/lib/ticketMap";
import { registerTickets, unregisteredIds } from "@/lib/ticketRegistry";
import { dayStart } from "@/lib/tickets";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["open", "resolved", "pending", "snoozed", "all"]);

/** รายการแจ้งปัญหาของ inbox โรงแรม — กรองตามสถานะและป้ายกำกับได้ */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "open";
  const label = url.searchParams.get("label") ?? "";
  const page = Math.max(1, Math.min(50, Number(url.searchParams.get("page")) || 1));

  return adminRoute(req, async (s) => {
    const q = new URLSearchParams({
      inbox_id: INBOX_ID,
      status: STATUSES.has(status) ? status : "open",
      assignee_type: "all",
      page: String(page),
    });
    if (/^[a-z0-9_-]{1,60}$/.test(label)) q.append("labels[]", label);
    const body = await cw<unknown>(s, acct(`/conversations?${q}`));
    const conversations = payloadArray(body).map(toConversation);
    // คำทักทายอัตโนมัติ "แชทใหม่" — ทำหลังส่งคำตอบ (after() รองรับทั้งเซิร์ฟเวอร์ปกติและ Vercel)
    if (q.get("status") === "open") after(() => runGreetings(s, conversations));
    // เลขตั๋ว: ทะเบียนใน Neon (ถาวร) — ถ้าไม่ได้เปิดใช้/ล้มเหลว ใช้วิธีคำนวณจาก Chatwoot แทน
    if (conversations.length > 0) {
      let map = new Map<number, string>();
      if (dbEnabled) {
        try {
          map = await registerTickets(await withDayBackfill(s, conversations));
        } catch (e) {
          console.error(`[db] registerTickets: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      if (map.size === 0) {
        try {
          map = await ticketMap((path) => cw<unknown>(s, path), Math.min(...conversations.map((c) => c.createdAt)));
        } catch {
          // ไม่มีเลขตั๋วชั่วคราว
        }
      }
      for (const c of conversations) c.ticket = map.get(c.id) ?? null;
    }
    return { conversations };
  });
}

/**
 * ถ้ามีเคสที่ยังไม่อยู่ในทะเบียน → ดึงเคส "ทั้งวัน" (ทุกสถานะ) ของวันที่เกี่ยวข้องจาก Chatwoot มาลงทะเบียนพร้อมกัน
 * เพื่อให้ลำดับ 001, 002… เรียงตามเวลาสร้างจริงของวันนั้น ไม่ใช่ตามลำดับที่คอนโซลบังเอิญเห็น (ดึงไม่สำเร็จก็ลงทะเบียนเท่าที่มี)
 */
async function withDayBackfill(s: Session, conversations: ConversationDTO[]): Promise<ConversationDTO[]> {
  const missing = new Set(await unregisteredIds(conversations.map((c) => c.id)));
  if (missing.size === 0) return conversations;
  const since = dayStart(Math.min(...conversations.filter((c) => missing.has(c.id)).map((c) => c.createdAt)));
  const seen = new Set(conversations.map((c) => c.id));
  const extra = await fetchConversationsSince((path) => cw<unknown>(s, path), since).catch(() => [] as ConversationDTO[]);
  return [...conversations, ...extra.filter((c) => !seen.has(c.id) && c.createdAt >= since)];
}
