import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { acct, cw } from "@/lib/cw";

type Ctx = { params: Promise<{ id: string }> };

/** ทำเครื่องหมายว่าอ่านแล้ว — เคลียร์ตัวเลขแจ้งเตือนสีแดง */
export async function POST(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  return adminRoute(
    req,
    async (s) => {
      await cw(s, acct(`/conversations/${id}/update_last_seen`), { method: "POST", json: {} });
      return { ok: true };
    },
    { mutating: true },
  );
}
