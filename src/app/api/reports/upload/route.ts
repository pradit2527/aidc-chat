import { NextResponse } from "next/server";
import { rateLimit, sameOrigin } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { saveUpload, uploadsEnabled, validateUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/**
 * พนักงานอัปโหลดรูป/วิดีโอประกอบ (multipart: file, who) ก่อนส่งรายงาน → คืน {id, token} ให้ใส่ใน POST /api/reports
 * ไฟล์เก็บบนดิสก์ของเซิร์ฟเวอร์ (UPLOAD_DIR) — บน Vercel ใช้ไม่ได้ (503 uploads_disabled)
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbEnabled || !(await uploadsEnabled())) return NextResponse.json({ error: "uploads_disabled" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`upload:${ip}`, 60)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const file = form.get("file");
  const who = typeof form.get("who") === "string" && /^cosi_[0-9a-f]{24}$/.test(String(form.get("who"))) ? String(form.get("who")) : "";
  if (!(file instanceof File)) return NextResponse.json({ error: "file_required" }, { status: 400 });
  const err = validateUpload(file.type, file.size);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  try {
    const saved = await saveUpload(new Uint8Array(await file.arrayBuffer()), file.type, file.name, who);
    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    console.error(`[reports] upload: ${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
