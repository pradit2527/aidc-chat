import { NextResponse, type NextRequest } from "next/server";
import { isHttps, loginAllowed, rateLimit, sameOrigin } from "@/lib/adminApi";
import { chatwootConfig } from "@/lib/chatwoot";
import { ACCOUNT_ID } from "@/lib/cw";
import { SESSION_COOKIE, SESSION_TTL_SEC, sealSession, type Session } from "@/lib/session";
import { authenticate, normalizeUsername } from "@/lib/users";

/**
 * ล็อกอินด้วยบัญชี Chatwoot ของผู้ใช้เอง — ส่งต่อให้ Chatwoot ตรวจ ไม่เก็บรหัสผ่านไว้ที่ไหน
 * ได้ token กลับมาแล้วเก็บในคุกกี้ httpOnly ที่เข้ารหัส
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!loginAllowed(ip)) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password || email.length > 200 || password.length > 200) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }

  // ไม่มี "@" = username ของแอดมินบัญชีในระบบเอง (สร้างที่ /admin/users) · มี "@" = อีเมลบัญชี Chatwoot
  if (!email.includes("@")) return localAdminLogin(req, email, password);

  const { baseUrl } = chatwootConfig();
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/auth/sign_in`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return NextResponse.json({ error: "chatwoot_unreachable" }, { status: 502 });
  }
  if (!res.ok) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  const token = res.headers.get("access-token");
  const client = res.headers.get("client");
  const uid = res.headers.get("uid");
  const data = ((await res.json().catch(() => ({}))) as { data?: Record<string, unknown> }).data ?? {};
  if (!token || !client || !uid) return NextResponse.json({ error: "chatwoot_error" }, { status: 502 });

  // ต้องเป็นสมาชิกของ account นี้เท่านั้น
  const accounts = Array.isArray(data.accounts) ? (data.accounts as { id?: unknown }[]) : [];
  if (!accounts.some((a) => String(a.id) === ACCOUNT_ID)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const session: Session = {
    token,
    client,
    uid,
    user: {
      id: Number(data.id) || 0,
      name: String(data.name || data.available_name || email),
      email: String(data.email || email),
    },
    exp: Date.now() + SESSION_TTL_SEC * 1000,
  };

  const out = NextResponse.json({ user: session.user });
  out.cookies.set(SESSION_COOKIE, sealSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(req),
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  return out;
}

/** แอดมินบัญชีในระบบเอง: ตรวจกับ app_users (role admin) — เซสชันไม่มี token Chatwoot (ใช้คอนโซลแชทไม่ได้) */
async function localAdminLogin(req: NextRequest, usernameRaw: string, password: string) {
  const username = normalizeUsername(usernameRaw);
  if (!rateLimit(`admin-login:${username}`, 12)) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  let user;
  try {
    user = await authenticate(username, password, "admin");
  } catch (e) {
    console.error("[admin] local login failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "chatwoot_error" }, { status: 502 });
  }
  if (!user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  const session: Session = {
    token: "",
    client: "",
    uid: `local:${user.id}`,
    user: { id: user.id, name: user.name, email: user.username, local: true },
    local: true,
    exp: Date.now() + SESSION_TTL_SEC * 1000,
  };
  const out = NextResponse.json({ user: session.user });
  out.cookies.set(SESSION_COOKIE, sealSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(req),
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  return out;
}
