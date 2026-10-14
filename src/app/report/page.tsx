import type { Metadata } from "next";
import { cookies } from "next/headers";
import ReportForm from "@/components/ReportForm";
import { dbEnabled } from "@/lib/db";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import { uploadsEnabled } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ແຈ້ງບັນຫາ",
  description: "ແຈ້ງບັນຫາເປັນຂໍ້ໆ ໃຫ້ທີມໄອທີ COSI Hotel",
};

/** แจ้งปัญหาแบบรายการ (ไม่ผ่านแชท) — ต้องมีฐานข้อมูล ไม่มี → ฟอร์มบอกให้ใช้แชทแทน */
export default async function ReportPage() {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return <ReportForm initialLang={isLang(saved) ? saved : DEFAULT_LANG} enabled={dbEnabled} uploads={await uploadsEnabled()} />;
}
