import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/adminApi";
import { parseNewUser } from "@/lib/userInput";
import { createUser, listUsers, UsernameTakenError } from "@/lib/users";

export const dynamic = "force-dynamic";

/** รายชื่อผู้ใช้พนักงาน (ไม่มีรหัสผ่าน) — เฉพาะแอดมินที่ล็อกอินคอนโซล */
export async function GET(req: Request) {
  const g = await adminGuard(req);
  if (g instanceof Response) return g;
  try {
    return NextResponse.json({ users: await listUsers() });
  } catch (e) {
    console.error("[admin/users] list failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}

/** แอดมินสร้างบัญชีพนักงาน (แทนการลงทะเบียนเอง) */
export async function POST(req: Request) {
  const g = await adminGuard(req, true);
  if (g instanceof Response) return g;
  const parsed = parseNewUser((await req.json().catch(() => null)) as Record<string, unknown> | null);
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  try {
    const user = await createUser(parsed);
    console.info(`[admin/users] ${g.user.email} created ${user.role} ${user.username}`);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    if (e instanceof UsernameTakenError) return NextResponse.json({ error: "username_taken" }, { status: 409 });
    console.error("[admin/users] create failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
