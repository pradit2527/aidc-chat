import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/adminApi";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
