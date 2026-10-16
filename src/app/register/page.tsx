import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getCurrentUser, safeNext } from "@/lib/userSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ລົງທະບຽນ",
  robots: { index: false, follow: false },
};

/** ลงทะเบียนผู้ใช้ใหม่ (ปุ่มจากหน้าล็อกอิน) */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, jar] = await Promise.all([searchParams, cookies()]);
  const dest = safeNext(next);
  if (await getCurrentUser()) redirect(dest);
  const saved = jar.get(LANG_COOKIE)?.value;
  return <AuthForm mode="register" next={dest} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
