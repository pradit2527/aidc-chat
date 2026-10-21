// กันหน้าฝั่งทีมไอที: ยังไม่ล็อกอิน → ไปหน้าล็อกอิน /admin พร้อมจำปลายทาง (?next=) เพื่อเด้งกลับมาหน้าเดิมหลังล็อกอิน
// ใช้กับลิงก์ในแจ้งเตือน WhatsApp (/admin/reports/<เลขตั๋ว>) ที่ทีมไอทีกดจากมือถือโดยยังไม่ได้ล็อกอิน
import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

/** ปลายทาง ?next= ที่ยอมรับ — เฉพาะ path ย่อยใต้ /admin/ (กันเด้งออกนอกระบบ และกันวนกลับมา /admin?next=… เอง) */
export function safeAdminNext(v: unknown): string | null {
  return typeof v === "string" && /^\/admin\/[A-Za-z0-9._%-]+(\/[A-Za-z0-9._%-]+)*(\?[A-Za-z0-9=&._%-]*)?$/.test(v) ? v : null;
}

export const adminLoginUrl = (next: string) => `/admin?next=${encodeURIComponent(next)}`;

/** คืนเซสชันของทีมไอที หรือ redirect ไปหน้าล็อกอิน (จำ next ไว้) */
export async function requireAdmin(next: string): Promise<Session> {
  let session: Session | null = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }
  if (!session) redirect(adminLoginUrl(next));
  return session;
}
