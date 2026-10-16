import { NextResponse } from "next/server";
import { rateLimit, sameOrigin } from "@/lib/adminApi";
import { clientIp, serverNotConfigured, signedIn, str } from "@/lib/authApi";
import { DEPARTMENTS } from "@/lib/categories";
import { createUser, normalizeUsername, PASSWORD_MAX, PASSWORD_MIN, UsernameTakenError, USERNAME_RE } from "@/lib/users";

/** ลงทะเบียนพนักงานใหม่ แล้วล็อกอินให้ทันที */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (serverNotConfigured()) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  if (!rateLimit(`register:${clientIp(req)}`, 10)) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const username = normalizeUsername(str(b?.username, 40));
  const password = typeof b?.password === "string" ? b.password : "";
  const name = str(b?.name, 80);
  const contact = str(b?.contact, 40);
  const dept = DEPARTMENTS.find((d) => d.id === b?.department);

  if (!USERNAME_RE.test(username)) return NextResponse.json({ error: "username_invalid" }, { status: 400 });
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return NextResponse.json({ error: "password_invalid" }, { status: 400 });
  }
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!dept) return NextResponse.json({ error: "department_required" }, { status: 400 });

  try {
    const user = await createUser({ username, password, name, department: dept.id, contact });
    return signedIn(req, user, 201);
  } catch (e) {
    if (e instanceof UsernameTakenError) return NextResponse.json({ error: "username_taken" }, { status: 409 });
    console.error("[auth] register failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
