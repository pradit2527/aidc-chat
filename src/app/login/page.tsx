import { redirect } from "next/navigation";

/** ทางลัด: /login → /admin (หน้าแอดมินแสดงฟอร์มล็อกอินเองเมื่อยังไม่ได้ล็อกอิน) */
export default function LoginRedirect() {
  redirect("/admin");
}
