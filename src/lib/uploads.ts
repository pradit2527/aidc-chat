// ไฟล์แนบของงานแจ้งปัญหา (รูป/วิดีโอ) — เก็บบนดิสก์ของเซิร์ฟเวอร์ใต้ UPLOAD_DIR (ค่าเริ่มต้น ./data/uploads)
// ข้อมูลไฟล์อยู่ในตาราง report_files; บน Vercel ดิสก์เขียนไม่ได้ → uploadsEnabled() = false (ฟอร์มซ่อนปุ่มแนบ)
import { randomBytes, randomUUID } from "node:crypto";
import { access, constants, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { dbEnabled, q } from "./db";
import { fileKind, type FileKind } from "./uploadRules";

export { fileKind, UPLOAD_LIMITS, validateUpload, type FileKind, type ReportFileDTO } from "./uploadRules";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/heic": "heic", "image/heif": "heif",
  "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/3gpp": "3gp", "video/x-m4v": "m4v",
};

export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
}

let enabledCache: { at: number; ok: boolean } | null = null;
/** มีฐานข้อมูลและเขียนโฟลเดอร์อัปโหลดได้หรือไม่ (ตรวจซ้ำทุก 60 วินาที) */
export async function uploadsEnabled(): Promise<boolean> {
  if (!dbEnabled) return false;
  if (enabledCache && Date.now() - enabledCache.at < 60_000) return enabledCache.ok;
  let ok = false;
  try {
    await mkdir(uploadDir(), { recursive: true });
    await access(uploadDir(), constants.W_OK);
    ok = true;
  } catch {
    ok = false;
  }
  enabledCache = { at: Date.now(), ok };
  return ok;
}

/** เขียนไฟล์ลงดิสก์ + บันทึกแถว "รอผูกกับรายงาน" → คืน id และ token ให้ฟอร์มส่งกลับมาตอนสร้างรายงาน */
export async function saveUpload(data: Uint8Array, mime: string, originalName: string, uploader: string) {
  const month = new Date().toISOString().slice(0, 7); // 2026-10
  const key = `${month}/${randomUUID()}.${EXT[mime] ?? "bin"}`;
  const full = path.join(uploadDir(), key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  const token = randomBytes(16).toString("hex");
  const name = originalName.normalize("NFC").replace(/[\\/:*?"<>|\r\n]+/g, "_").trim().slice(0, 120) || "file";
  const [row] = await q<{ id: string }>(
    `INSERT INTO report_files (token, uploader, original_name, mime, size, storage_key)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id::text`,
    [token, uploader, name, mime, data.byteLength, key],
  );
  return { id: Number(row.id), token, name, mime, size: data.byteLength, kind: fileKind(mime) as FileKind };
}

export type StoredFile = {
  id: number;
  reportId: number | null;
  uploader: string;
  ownerIdentifier: string;
  name: string;
  mime: string;
  size: number;
  path: string;
};

/** ข้อมูลไฟล์ + path จริงบนดิสก์ (null = ไม่มีแถวหรือไฟล์หาย) */
export async function getStoredFile(id: number): Promise<StoredFile | null> {
  const [r] = await q<Record<string, unknown>>(
    `SELECT f.id::text AS id, f.report_id::text AS report_id, f.uploader, f.original_name, f.mime, f.size::text AS size, f.storage_key,
            COALESCE(r.identifier, '') AS owner
       FROM report_files f LEFT JOIN reports r ON r.id = f.report_id WHERE f.id = $1`,
    [id],
  );
  if (!r) return null;
  const full = path.join(uploadDir(), String(r.storage_key));
  try {
    await stat(full);
  } catch {
    return null;
  }
  return {
    id: Number(r.id),
    reportId: r.report_id === null ? null : Number(r.report_id),
    uploader: String(r.uploader ?? ""),
    ownerIdentifier: String(r.owner ?? ""),
    name: String(r.original_name),
    mime: String(r.mime),
    size: Number(r.size),
    path: full,
  };
}
