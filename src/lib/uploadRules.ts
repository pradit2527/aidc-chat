// กติกาไฟล์แนบ (ชนิด/ขนาด) — ไฟล์นี้ไม่ใช้โมดูลของ Node จึง import ได้ทั้งฝั่ง browser และเซิร์ฟเวอร์
export const UPLOAD_LIMITS = {
  files: 5,
  imageBytes: 10 * 1024 * 1024,
  videoBytes: 50 * 1024 * 1024,
};

export const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
export const VIDEO_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm", "video/3gpp", "video/x-m4v"]);

export type FileKind = "image" | "video";
export type ReportFileDTO = { id: number; name: string; mime: string; size: number; kind: FileKind };

export const fileKind = (mime: string): FileKind | null => (IMAGE_MIMES.has(mime) ? "image" : VIDEO_MIMES.has(mime) ? "video" : null);

/** ตรวจชนิดและขนาด — คืน error code สั้น ๆ หรือ null ถ้าผ่าน */
export function validateUpload(mime: string, size: number): string | null {
  const kind = fileKind(mime);
  if (!kind) return "file_type";
  if (size <= 0) return "file_empty";
  if (kind === "image" && size > UPLOAD_LIMITS.imageBytes) return "file_too_big";
  if (kind === "video" && size > UPLOAD_LIMITS.videoBytes) return "file_too_big";
  return null;
}
