import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SupportPortal from "@/components/SupportPortal";
import SyncProfile from "@/components/SyncProfile";
import { chatwootConfig } from "@/lib/chatwoot";
import { chatEnabled } from "@/lib/features";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { requireUser } from "@/lib/userSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ລະບົບການແຈ້ງບັນຫາ",
  description: "ແຊັດຫາທີມໄອທີ COSI Hotel — IT support chat for COSI Hotel staff",
};

/** หน้าแชทกับทีมไอที — ซ่อนอยู่ (ผู้ใช้สั่ง) จึงเด้งไปหน้าหลัก /start เว้นแต่ตั้ง CHAT_ENABLED=1; ต้องล็อกอินพนักงานก่อน */
export default async function ChatPage() {
  if (!chatEnabled()) redirect("/start");
  const { profile } = await requireUser("/chat");
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  // ส่งเฉพาะค่าสาธารณะไปฝั่ง browser — hmacToken อยู่ที่เซิร์ฟเวอร์เท่านั้น
  const { baseUrl, websiteToken } = chatwootConfig();
  return (
    <>
      <SyncProfile profile={profile} />
      <SupportPortal baseUrl={baseUrl} websiteToken={websiteToken} initialLang={isLang(saved) ? saved : DEFAULT_LANG} profile={profile} />
    </>
  );
}
