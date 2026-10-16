import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getManager } from "@/lib/managerSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · Manager",
  robots: { index: false, follow: false },
};

/** ล็อกอินหัวหน้าโรงแรม → /manager (ล็อกอินค้างอยู่แล้วข้ามไปเลย) */
export default async function ManagerLoginPage() {
  if (await getManager()) redirect("/manager");
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return <AuthForm manager next="/manager" initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
