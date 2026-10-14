import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReportsConsole from "@/components/ReportsConsole";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT Helpdesk · ງານແຈ້ງບັນຫາ",
  robots: { index: false, follow: false },
};

/** หน้ามอนิเตอร์งานแจ้งปัญหาของทีมไอที — ต้องล็อกอินคอนโซลก่อน (ไม่มีเซสชันจะเด้งไป /admin) */
export default async function AdminReportsPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  let session = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }
  if (!session) redirect("/admin");
  return <ReportsConsole user={session.user} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
