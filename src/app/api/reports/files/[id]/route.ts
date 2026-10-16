import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { parseId } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { getManager } from "@/lib/managerSession";
import { getSession } from "@/lib/session";
import { getStoredFile } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * ส่งไฟล์แนบ (รูป/วิดีโอ): ทีมไอทีและหัวหน้าที่ล็อกอินดูได้ทุกไฟล์, เจ้าของรายงานดูได้ด้วย ?who=<identifier> (ตรงกับผู้ส่ง)
 * รองรับ Range เพื่อให้วิดีโอเลื่อนดูได้
 */
export async function GET(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const f = await getStoredFile(id);
  if (!f) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let admin = false;
  try {
    admin = (await getSession()) !== null;
  } catch {
    admin = false;
  }
  // หัวหน้าโรงแรม (แดชบอร์ด /manager) ดูไฟล์แนบได้ทุกไฟล์ด้วย
  if (!admin) admin = (await getManager()) !== null;
  const who = new URL(req.url).searchParams.get("who") ?? "";
  const owner = who !== "" && (who === f.ownerIdentifier || (f.reportId === null && who === f.uploader));
  if (!admin && !owner) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const headers: Record<string, string> = {
    "content-type": f.mime,
    "cache-control": "private, max-age=3600",
    "accept-ranges": "bytes",
    "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`,
    "x-content-type-options": "nosniff",
  };
  const range = req.headers.get("range");
  const m = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : Math.max(0, f.size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), f.size - 1) : f.size - 1;
    if (Number.isNaN(start) || start > end || start >= f.size) {
      return new NextResponse(null, { status: 416, headers: { "content-range": `bytes */${f.size}` } });
    }
    const stream = Readable.toWeb(createReadStream(f.path, { start, end })) as ReadableStream;
    return new NextResponse(stream, {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${f.size}`, "content-length": String(end - start + 1) },
    });
  }
  const stream = Readable.toWeb(createReadStream(f.path)) as ReadableStream;
  return new NextResponse(stream, { status: 200, headers: { ...headers, "content-length": String(f.size) } });
}
