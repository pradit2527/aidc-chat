import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ReportsConsole from "@/components/ReportsConsole";
import { requireAdmin } from "@/lib/adminGuard";
import { dbEnabled } from "@/lib/db";
import { chatEnabled } from "@/lib/features";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { findReportIdByTicket, isTicketNo } from "@/lib/reports";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ticket Support · ງານແຈ້ງບັນຫາ",
  robots: { index: false, follow: false },
};

/**
 * เปิดงานแจ้งปัญหาด้วยเลขตั๋ว (ลิงก์ในแจ้งเตือน WhatsApp): /admin/reports/Ticket21-10-2026-009
 * ยังไม่ล็อกอิน → หน้าล็อกอินแล้วเด้งกลับมาเปิดตั๋วนี้ทันที; ไม่พบเลขตั๋ว → หน้ารายการงานแจ้ง
 */
export default async function AdminReportByTicketPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const ticketNo = decodeURIComponent(no);
  if (!isTicketNo(ticketNo)) notFound();
  const session = await requireAdmin(`/admin/reports/${ticketNo}`);
  const id = dbEnabled ? await findReportIdByTicket(ticketNo) : null;
  if (!id) redirect("/admin/reports");
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return <ReportsConsole user={session.user} initialLang={isLang(saved) ? saved : DEFAULT_LANG} initialReportId={id} chat={chatEnabled()} />;
}
