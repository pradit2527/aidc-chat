import { after } from "next/server";
import { adminRoute } from "@/lib/adminApi";
import { acct, cw, INBOX_ID, payloadArray, toConversation } from "@/lib/cw";
import { runGreetings } from "@/lib/greeter";
import { ticketMap } from "@/lib/ticketMap";

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
    // เลขตั๋ว: ต้องดูเคสของวันนั้นทั้งหมดจึงนับลำดับได้ถูก (มีแคช 20 วินาที) — ถ้าล้มเหลวก็แสดงเคสได้ตามปกติ
    if (conversations.length > 0) {
      try {
        const map = await ticketMap((path) => cw<unknown>(s, path), Math.min(...conversations.map((c) => c.createdAt)));
        for (const c of conversations) c.ticket = map.get(c.id) ?? null;
      } catch {
        // ไม่มีเลขตั๋วชั่วคราว
      }
    }
    return { conversations };
  });
}
