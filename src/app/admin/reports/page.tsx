import type { Metadata } from "next";
import { cookies } from "next/headers";
import ReportsConsole from "@/components/ReportsConsole";
import { requireAdmin } from "@/lib/adminGuard";
import { chatEnabled } from "@/lib/features";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT Helpdesk · ງານແຈ້ງບັນຫາ",
  robots: { index: false, follow: false },
};

/** หน้ามอนิเตอร์งานแจ้งปัญหาของทีมไอที — ต้องล็อกอินคอนโซลก่อน (ไม่มีเซสชันจะเด้งไป /admin) */
export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const [{ r }, jar] = await Promise.all([searchParams, cookies()]);
  const saved = jar.get(LANG_COOKIE)?.value;
  const initialReportId = /^\d{1,12}$/.test(r ?? "") ? Number(r) : null;
  // ยังไม่ล็อกอิน → หน้าล็อกอินแล้วเด้งกลับมาที่งานเดิม (ลิงก์จากหน้าหลัก/แจ้งเตือน)
  const session = await requireAdmin(initialReportId ? `/admin/reports?r=${initialReportId}` : "/admin/reports");
  return <ReportsConsole user={session.user} initialLang={isLang(saved) ? saved : DEFAULT_LANG} initialReportId={initialReportId} chat={chatEnabled()} />;
}
