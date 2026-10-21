import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminApp from "@/components/AdminApp";
import type { AdminUser } from "@/lib/adminTypes";
import { chatEnabled } from "@/lib/features";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ticket Support",
  robots: { index: false, follow: false },
};

/** คอนโซลตอบแชทของทีมไอที — ซ่อนอยู่ (เด้งไป /admin) เว้นแต่ CHAT_ENABLED=1; ?c=<id> เปิดเคสนั้นทันที */
export default async function AdminChatPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  if (!chatEnabled()) redirect("/admin");
  const [{ c }, jar] = await Promise.all([searchParams, cookies()]);
  const saved = jar.get(LANG_COOKIE)?.value;
  const initialLang = isLang(saved) ? saved : DEFAULT_LANG;
  const initialConversationId = /^\d{1,12}$/.test(c ?? "") ? Number(c) : null;

  const configured = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16);
  let user: AdminUser | null = null;
  if (configured) {
    try {
      user = (await getSession())?.user ?? null;
    } catch {
      user = null;
    }
  }
  if (user?.local && !user.chat) redirect("/admin"); // แอดมินในระบบเองจะใช้แชทได้ต้องตั้ง CHATWOOT_AGENT_TOKEN
  return <AdminApp initialLang={initialLang} user={user} configured={configured} view="chat" initialConversationId={initialConversationId} chat />;
}
