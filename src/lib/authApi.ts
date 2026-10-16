// ตัวช่วยของ route /api/auth/* (ล็อกอิน/ลงทะเบียนพนักงาน)
import { NextResponse } from "next/server";
import { isHttps } from "./adminApi";
import { profileOf, sealUser, USER_COOKIE, USER_TTL_SEC } from "./userSession";
import type { User } from "./users";

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

export const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, max) : "";

/** ตอบสำเร็จ + ตั้งคุกกี้เซสชัน + ส่ง Profile กลับให้หน้าเว็บเก็บใช้กับแชท */
export function signedIn(req: Request, user: User, status = 200) {
  const res = NextResponse.json({ profile: profileOf(user) }, { status });
  res.cookies.set(USER_COOKIE, sealUser(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(req),
    path: "/",
    maxAge: USER_TTL_SEC,
  });
  return res;
}

export const serverNotConfigured = () => {
  const s = process.env.SESSION_SECRET;
  return !s || s.length < 16;
};
