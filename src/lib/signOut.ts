// ฝั่ง browser — ออกจากระบบพนักงาน: ลบคุกกี้เซสชัน, ล้างข้อมูลในเครื่อง + แชท แล้วกลับหน้าล็อกอิน
import { saveProfile } from "./profileStore";
import { resetChatwoot } from "./widget";

export async function signOutUser() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ออฟไลน์ — ล้างข้อมูลในเครื่องแล้วไปหน้าล็อกอินต่อ (คุกกี้จะหมดอายุเอง)
  }
  resetChatwoot();
  saveProfile(null);
  window.location.assign("/login");
}
