import { NextResponse } from "next/server";
import { adminGuard, parseId } from "@/lib/adminApi";
import { parseUserFields, validPassword } from "@/lib/userInput";
import { deleteUser, updateUser } from "@/lib/users";

type Ctx = { params: Promise<{ id: string }> };

/** แก้ชื่อ/แผนก/เบอร์ต่อ และตั้งรหัสผ่านใหม่ (ใส่ password เฉพาะเมื่อต้องการเปลี่ยน) */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await adminGuard(req, true);
  if (g instanceof Response) return g;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const f = parseUserFields(b);
  if ("error" in f) return NextResponse.json(f, { status: 400 });
  const hasPw = typeof b?.password === "string" && b.password !== "";
  if (hasPw && !validPassword(b?.password)) return NextResponse.json({ error: "password_invalid" }, { status: 400 });
  try {
    const user = await updateUser(id, { ...f, ...(hasPw ? { password: b?.password as string } : {}) });
    if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
    console.info(`[admin/users] ${g.user.email} updated user ${user.username}${hasPw ? " (password reset)" : ""}`);
    return NextResponse.json({ user });
  } catch (e) {
    console.error("[admin/users] update failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await adminGuard(req, true);
  if (g instanceof Response) return g;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  try {
    if (!(await deleteUser(id))) return NextResponse.json({ error: "not_found" }, { status: 404 });
    console.info(`[admin/users] ${g.user.email} deleted user id ${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/users] delete failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
