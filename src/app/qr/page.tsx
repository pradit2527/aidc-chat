import { redirect } from "next/navigation";

/** ลิงก์เดิม /qr → หน้าแรก (โปสเตอร์ QR ย้ายมาอยู่ที่ /) คง ?tools=1 ไว้ */
export default async function QrRedirect({ searchParams }: { searchParams: Promise<{ tools?: string }> }) {
  const { tools } = await searchParams;
  redirect(tools === "1" ? "/?tools=1" : "/");
}
