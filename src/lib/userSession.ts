// เซสชันของพนักงานโรงแรมที่ล็อกอินที่ /login — คุกกี้ httpOnly เข้ารหัส (แยกจากเซสชันทีมไอที cosi_admin)
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEPARTMENTS } from "./categories";
import { signIdentifier } from "./chatwoot";
import { sealJson, unsealJson } from "./session";
import { getUserById, type User } from "./users";
import type { Profile } from "./widget";

export const USER_COOKIE = "cosi_user";
export const USER_TTL_SEC = 30 * 24 * 60 * 60;

type UserSession = { uid: number; exp: number };

export const sealUser = (uid: number) => sealJson({ uid, exp: Date.now() + USER_TTL_SEC * 1000 } satisfies UserSession);

/** แปลงบัญชี → Profile ที่หน้าแชท/แจ้งปัญหาใช้ (identifier คงที่ต่อ username + HMAC ให้ Chatwoot) */
export function profileOf(u: User): Profile {
  const identifier = "cosi_" + createHash("sha256").update(`user|${u.username}`, "utf8").digest("hex").slice(0, 24);
  const dept = DEPARTMENTS.find((d) => d.id === u.department);
  return {
    name: u.name,
    department: u.department,
    departmentLabel: dept?.label.en ?? u.department, // Chatwoot ใช้อังกฤษให้ทีมไอทีอ่านตรงกัน
    contact: u.contact,
    identifier,
    identifierHash: signIdentifier(identifier),
  };
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const s = unsealJson<UserSession>((await cookies()).get(USER_COOKIE)?.value);
    const u = s ? await getUserById(s.uid) : null;
    return u?.role === "staff" ? u : null; // บัญชีแอดมินใช้เข้าพอร์ทัลพนักงานไม่ได้
  } catch {
    return null; // SESSION_SECRET/ที่เก็บผู้ใช้ใช้ไม่ได้ → ถือว่ายังไม่ล็อกอิน
  }
}

/** กันหน้าพนักงาน: ยังไม่ล็อกอิน → ไป /login (จำปลายทางไว้ใน ?next=) */
export async function requireUser(next: string): Promise<{ user: User; profile: Profile }> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { user, profile: profileOf(user) };
}

/** ปลายทาง ?next= ที่ปลอดภัย — เฉพาะ path ภายในหน้าพนักงาน */
export function safeNext(v: unknown): string {
  return typeof v === "string" && /^\/(start|chat|report)(\/[A-Za-z0-9._-]+)?$/.test(v) ? v : "/start";
}
