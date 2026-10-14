import type { Metadata } from "next";
import { cookies } from "next/headers";
import StartHub from "@/components/StartHub";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ລະບົບການແຈ້ງບັນຫາ",
  description: "ເລືອກແຊັດກັບທີມໄອທີ ຫຼື ແຈ້ງບັນຫາ — COSI Hotel IT support",
};

/** หน้าหลักของพนักงาน (ปลายทาง QR): เลือกระบบแชท หรือ แจ้งปัญหา */
export default async function StartPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return <StartHub initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
