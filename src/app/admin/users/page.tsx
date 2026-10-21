import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UsersConsole from "@/components/UsersConsole";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ticket Support · ຜູ້ໃຊ້ງານ",
  robots: { index: false, follow: false },
};

/** จัดการบัญชีพนักงาน (สร้าง/แก้ไข/รีเซ็ตรหัสผ่าน/ลบ) — ต้องล็อกอินคอนโซลก่อน */
export default async function AdminUsersPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  let session = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }
  if (!session) redirect("/admin");
  return <UsersConsole user={session.user} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
