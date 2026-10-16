import { NextResponse } from "next/server";
import { isHttps, rateLimit, sameOrigin } from "@/lib/adminApi";
import { clientIp, serverNotConfigured, str } from "@/lib/authApi";
import { MANAGER_COOKIE, MANAGER_TTL_SEC, sealManager } from "@/lib/managerSession";
import { authenticate, normalizeUsername, PASSWORD_MAX } from "@/lib/users";

/** ล็อกอินหัวหน้าโรงแรม → คุกกี้ cosi_manager (เข้าได้เฉพาะบัญชี role manager) */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (serverNotConfigured()) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  if (!rateLimit(`mgr-ip:${clientIp(req)}`, 40)) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const b = (await req.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  const username = normalizeUsername(str(b?.username, 40));
  const password = typeof b?.password === "string" ? b.password : "";
  if (!username || !password || password.length > PASSWORD_MAX) return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  if (!rateLimit(`mgr:${username}`, 12)) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  try {
    const user = await authenticate(username, password, "manager");
    if (!user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    const res = NextResponse.json({ ok: true, name: user.name });
    res.cookies.set(MANAGER_COOKIE, sealManager(user.id), { httpOnly: true, sameSite: "lax", secure: isHttps(req), path: "/", maxAge: MANAGER_TTL_SEC });
    return res;
  } catch (e) {
    console.error("[manager] login failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
