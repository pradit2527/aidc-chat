import type { Metadata } from "next";
import { cookies } from "next/headers";
import StartHub from "@/components/StartHub";
import SyncProfile from "@/components/SyncProfile";
import { chatEnabled } from "@/lib/features";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { requireUser } from "@/lib/userSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ລະບົບການແຈ້ງບັນຫາ",
  description: "ແຈ້ງບັນຫາຫາທີມໄອທີ COSI Hotel ແລະ ຕິດຕາມສະຖານະ — COSI Hotel IT support",
};

/** หน้าหลักของพนักงาน (หลังล็อกอินจาก QR → /login): แจ้งปัญหา + รายงานของฉัน (มีการ์ดแชทด้วยเมื่อ CHAT_ENABLED=1) */
export default async function StartPage() {
  const { profile } = await requireUser("/start");
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return (
    <>
      <SyncProfile profile={profile} />
      <StartHub initialLang={isLang(saved) ? saved : DEFAULT_LANG} profile={profile} chat={chatEnabled()} />
    </>
  );
}
