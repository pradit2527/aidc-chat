import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/adminApi";
import { MANAGER_COOKIE } from "@/lib/managerSession";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(MANAGER_COOKIE);
  return res;
}
