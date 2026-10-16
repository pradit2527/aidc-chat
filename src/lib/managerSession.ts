// เซสชันของหัวหน้าโรงแรม (role manager) ที่ล็อกอินที่ /manager/login — คุกกี้แยกจากพนักงาน/แอดมิน
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sealJson, unsealJson } from "./session";
import { getUserById, type User } from "./users";

export const MANAGER_COOKIE = "cosi_manager";
export const MANAGER_TTL_SEC = 12 * 60 * 60;

type ManagerSession = { uid: number; exp: number };

export const sealManager = (uid: number) => sealJson({ uid, exp: Date.now() + MANAGER_TTL_SEC * 1000 } satisfies ManagerSession);

/** หัวหน้าที่ล็อกอินอยู่ (บัญชีถูกลบ/เปลี่ยนบทบาท → null ทันที) */
export async function getManager(): Promise<User | null> {
  try {
    const s = unsealJson<ManagerSession>((await cookies()).get(MANAGER_COOKIE)?.value);
    const u = s ? await getUserById(s.uid) : null;
    return u?.role === "manager" ? u : null;
  } catch {
    return null;
  }
}

export async function requireManager(): Promise<User> {
  const u = await getManager();
  if (!u) redirect("/manager/login");
  return u;
}
