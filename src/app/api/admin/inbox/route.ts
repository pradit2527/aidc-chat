import { adminRoute } from "@/lib/adminApi";
import { acct, cw, INBOX_ID } from "@/lib/cw";

export const dynamic = "force-dynamic";

const asObj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/** ข้อมูลช่องแชท (inbox) ที่คอนโซลนี้แสดง — ใช้โชว์ชื่อช่องที่หัวรายการ */
export async function GET(req: Request) {
  return adminRoute(req, async (s) => {
    let name = "";
    let channel = "";
    try {
      const raw = asObj(await cw<unknown>(s, acct(`/inboxes/${INBOX_ID}`)));
      const o = asObj(raw.payload ?? raw);
      name = typeof o.name === "string" ? o.name : "";
      channel = typeof o.channel_type === "string" ? o.channel_type : "";
    } catch {
      // ดึงชื่อไม่ได้ก็ไม่เป็นไร — หน้าจอจะใช้ชื่อสำรอง
    }
    return { id: Number(INBOX_ID), name, channel };
  });
}
