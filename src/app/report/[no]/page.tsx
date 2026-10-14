import type { Metadata } from "next";
import { cookies } from "next/headers";
import ReportStatus from "@/components/ReportStatus";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · ສະຖານະລາຍງານ",
  robots: { index: false, follow: false },
};

/** พนักงานดูสถานะรายงานของตัวเอง (เลขตั๋วใน URL + identifier จากเครื่องที่ส่ง) */
export default async function ReportStatusPage({ params }: { params: Promise<{ no: string }> }) {
  const [{ no }, jar] = await Promise.all([params, cookies()]);
  const saved = jar.get(LANG_COOKIE)?.value;
  return <ReportStatus no={decodeURIComponent(no).slice(0, 40)} initialLang={isLang(saved) ? saved : DEFAULT_LANG} />;
}
