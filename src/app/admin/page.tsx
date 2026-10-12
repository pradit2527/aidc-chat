import type { Metadata } from "next";
import { cookies } from "next/headers";
import AdminApp from "@/components/AdminApp";
import type { AdminUser } from "@/lib/adminTypes";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT Helpdesk · Reply Console",
  robots: { index: false, follow: false },
};

const DEMO_USER: AdminUser = { id: 1, name: "Pradit (demo)", email: "demo@example.invalid" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const [{ demo }, jar] = await Promise.all([searchParams, cookies()]);
  const saved = jar.get(LANG_COOKIE)?.value;
  const initialLang = isLang(saved) ? saved : DEFAULT_LANG;

  // โหมดตัวอย่าง (ข้อมูลปลอม ไม่เรียก Chatwoot) เปิดได้เฉพาะตอนพัฒนา
  if (demo === "1" && process.env.NODE_ENV !== "production") {
    return <AdminApp initialLang={initialLang} user={DEMO_USER} configured demo />;
  }

  const configured = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16);
  let user: AdminUser | null = null;
  if (configured) {
    try {
      user = (await getSession())?.user ?? null;
    } catch {
      user = null;
    }
  }
  return <AdminApp initialLang={initialLang} user={user} configured={configured} />;
}
