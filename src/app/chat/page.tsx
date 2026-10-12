import type { Metadata } from "next";
import { cookies } from "next/headers";
import SupportPortal from "@/components/SupportPortal";
import { chatwootConfig } from "@/lib/chatwoot";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ລະບົບການແຈ້ງບັນຫາ",
  description: "ແຊັດຫາທີມໄອທີ COSI Hotel — IT support chat for COSI Hotel staff",
};

/** หน้าแจ้งปัญหาของพนักงาน (ปลายทางของ QR) */
export default async function ChatPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  // ส่งเฉพาะค่าสาธารณะไปฝั่ง browser — hmacToken อยู่ที่เซิร์ฟเวอร์เท่านั้น
  const { baseUrl, websiteToken } = chatwootConfig();
  return (
    <SupportPortal baseUrl={baseUrl} websiteToken={websiteToken} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />
  );
}
