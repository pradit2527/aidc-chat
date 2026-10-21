import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WhatsAppSettings from "@/components/WhatsAppSettings";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT Helpdesk · WhatsApp",
  robots: { index: false, follow: false },
};

/** ตั้งค่าแจ้งเตือน WhatsApp (เบอร์ผู้รับ, ทดสอบ, ประวัติ) — ต้องล็อกอินคอนโซลก่อน (ไม่มีเซสชันจะเด้งไป /admin) */
export default async function AdminWhatsAppPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  let session = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }
  if (!session) redirect("/admin");
  return <WhatsAppSettings user={session.user} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
