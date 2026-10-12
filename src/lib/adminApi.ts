// ตัวช่วยสำหรับ route handler ของคอนโซลไอที: ตรวจเซสชัน, ป้องกัน CSRF, แปลง error
import { NextResponse } from "next/server";
import { CwError } from "./cw";
import { getSession, SESSION_COOKIE, type Session } from "./session";

/** POST/PUT ต้องมาจากหน้าเว็บของเราเอง (Origin ตรงกับ Host) — กัน CSRF */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isHttps(req: Request): boolean {
  return req.headers.get("x-forwarded-proto") === "https" || new URL(req.url).protocol === "https:";
}

export async function adminRoute(
  req: Request,
  handler: (s: Session) => Promise<unknown>,
  opts: { mutating?: boolean } = {},
): Promise<Response> {
  if (opts.mutating && !sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let session: Session | null = null;
  try {
    session = await getSession();
  } catch {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await handler(session));
  } catch (e) {
    if (e instanceof CwError && e.status === 401) {
      const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    const status = e instanceof CwError && e.status >= 400 && e.status < 500 ? e.status : 502;
    // บันทึกลง log ของเซิร์ฟเวอร์ (ไม่มี token) ไว้ไล่ปัญหาเมื่อ Chatwoot ตอบผิดรูปแบบ
    console.error(
      `[admin] ${req.method} ${new URL(req.url).pathname} → chatwoot ${e instanceof CwError ? e.status : "error"}: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
    return NextResponse.json({ error: "chatwoot_error" }, { status });
  }
}

/** จำกัดจำนวนครั้งล็อกอินต่อ IP (ในหน่วยความจำ — พอสำหรับ instance เดียว) */
const attempts = new Map<string, { n: number; reset: number }>();
export function loginAllowed(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.reset < now) {
    attempts.set(ip, { n: 1, reset: now + 5 * 60_000 });
    return true;
  }
  a.n += 1;
  return a.n <= 10;
}

export const parseId = (v: string) => (/^\d{1,12}$/.test(v) ? Number(v) : null);
