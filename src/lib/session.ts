// เซสชันของทีมไอที — เก็บ token ของ Chatwoot ในคุกกี้ httpOnly ที่เข้ารหัส AES-256-GCM
// ผู้ใช้แต่ละคนล็อกอินด้วยบัญชี Chatwoot ของตัวเอง ข้อความที่ตอบจึงขึ้นชื่อคนที่ตอบจริง
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { AdminUser } from "./adminTypes";

export const SESSION_COOKIE = "cosi_admin";
export const SESSION_TTL_SEC = 12 * 60 * 60;

export type Session = {
  token: string;
  client: string;
  uid: string;
  user: AdminUser;
  /** หมดอายุ (ms) */
  exp: number;
};

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET ยังไม่ได้ตั้งค่า (.env.local)");
  return createHash("sha256").update(secret).digest();
}

export function sealSession(s: Session): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(s), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64url");
}

export function unsealSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const raw = Buffer.from(value, "base64url");
    const d = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    const json = Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8");
    const s = JSON.parse(json) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null; // คุกกี้ถูกแก้ไข / secret เปลี่ยน → ถือว่าไม่ได้ล็อกอิน
  }
}

/** ใช้ใน server component และ route handler */
export async function getSession(): Promise<Session | null> {
  return unsealSession((await cookies()).get(SESSION_COOKIE)?.value);
}
