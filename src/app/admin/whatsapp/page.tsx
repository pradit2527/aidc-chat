import type { Metadata } from "next";
import { cookies } from "next/headers";
import WhatsAppSettings from "@/components/WhatsAppSettings";
import { requireAdmin } from "@/lib/adminGuard";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT Helpdesk · WhatsApp",
  robots: { index: false, follow: false },
};

/** ตั้งค่าแจ้งเตือน WhatsApp (เบอร์ผู้รับ, ทดสอบ, ประวัติ) — ต้องล็อกอินคอนโซลก่อน (ไม่มีเซสชันจะเด้งไป /admin) */
export default async function AdminWhatsAppPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  const session = await requireAdmin("/admin/whatsapp");
  return <WhatsAppSettings user={session.user} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
