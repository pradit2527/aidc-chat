import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/adminApi";
import { USER_COOKIE } from "@/lib/userSession";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(USER_COOKIE);
  return res;
}
