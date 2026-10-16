import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getCurrentUser, safeNext } from "@/lib/userSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ເຂົ້າສູ່ລະບົບ",
  robots: { index: false, follow: false },
};

/** ปลายทางของ QR: ล็อกอินพนักงาน → หน้าหลัก /start (ทีมไอทีเข้า /admin ตรง ๆ ด้วยบัญชี Chatwoot) */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, jar] = await Promise.all([searchParams, cookies()]);
  const dest = safeNext(next);
  if (await getCurrentUser()) redirect(dest); // ล็อกอินค้างอยู่แล้ว ไม่ต้องกรอกซ้ำ
  const saved = jar.get(LANG_COOKIE)?.value;
  return <AuthForm next={dest} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
