import { NextResponse } from "next/server";
import { loginAllowed, rateLimit, sameOrigin } from "@/lib/adminApi";
import { clientIp, serverNotConfigured, signedIn, str } from "@/lib/authApi";
import { authenticate, normalizeUsername, PASSWORD_MAX } from "@/lib/users";

/** ล็อกอินพนักงาน: username + รหัสผ่าน → คุกกี้เซสชัน + Profile */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (serverNotConfigured()) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  if (!loginAllowed(clientIp(req))) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const body = (await req.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  const username = normalizeUsername(str(body?.username, 40));
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password || password.length > PASSWORD_MAX) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }
  // จำกัดต่อ username ด้วย กันเดารหัสผ่านจากหลาย IP
  if (!rateLimit(`login:${username}`, 8)) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  try {
    const user = await authenticate(username, password);
    if (!user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    return signedIn(req, user);
  } catch (e) {
    console.error("[auth] login failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
