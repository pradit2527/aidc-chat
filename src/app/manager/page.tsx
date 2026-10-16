import type { Metadata } from "next";
import { cookies } from "next/headers";
import ManagerDashboard from "@/components/ManagerDashboard";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { requireManager } from "@/lib/managerSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · Dashboard",
  robots: { index: false, follow: false },
};

/** แดชบอร์ดสรุปแชท + แจ้งปัญหาทั้งหมด สำหรับหัวหน้าโรงแรม (ต้องล็อกอินที่ /manager/login) */
export default async function ManagerPage() {
  const user = await requireManager();
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return <ManagerDashboard name={user.name} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
