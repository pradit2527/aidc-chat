import { notFound, redirect } from "next/navigation";
import { isTicketNo } from "@/lib/tickets";

export const dynamic = "force-dynamic";

/**
 * ลิงก์สั้นในแจ้งเตือน WhatsApp (ผู้ใช้สั่งตัด /admin/reports ออก): https://ticket.aidclaos.com/cosi-21-10-2026-013
 * → หน้ารายละเอียดตั๋วของทีมไอที (ยังไม่ล็อกอินจะไปล็อกอินก่อนแล้วเด้งกลับมา); path ที่ไม่ใช่เลขตั๋ว → 404 ตามปกติ
 */
export default async function TicketShortLink({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params;
  const no = decodeURIComponent(ticket);
  if (!isTicketNo(no)) notFound();
  redirect(`/admin/reports/${encodeURIComponent(no)}`);
}
