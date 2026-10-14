// ไฟล์แนบ: ตรวจชนิด/ขนาด และโฟลเดอร์เก็บไฟล์ (ตรรกะล้วน)
import { uploadDir } from "@/lib/uploads";
import { fileKind, UPLOAD_LIMITS, validateUpload } from "@/lib/uploadRules";

describe("fileKind / validateUpload", () => {
  test.each([
    ["image/jpeg", "image"],
    ["image/png", "image"],
    ["image/webp", "image"],
    ["image/heic", "image"],
    ["video/mp4", "video"],
    ["video/quicktime", "video"],
    ["video/webm", "video"],
    ["application/pdf", null],
    ["text/html", null],
    ["", null],
  ])("%s → %p", (mime, kind) => expect(fileKind(mime)).toBe(kind));

  test("ขีดจำกัด: 5 ไฟล์, รูป 10 MB, วิดีโอ 50 MB", () => {
    expect(UPLOAD_LIMITS).toEqual({ files: 5, imageBytes: 10 * 1024 * 1024, videoBytes: 50 * 1024 * 1024 });
  });

  test.each([
    ["รูปปกติ", "image/jpeg", 500_000, null],
    ["รูปพอดีเพดาน", "image/png", 10 * 1024 * 1024, null],
    ["รูปเกินเพดาน", "image/png", 10 * 1024 * 1024 + 1, "file_too_big"],
    ["วิดีโอปกติ", "video/mp4", 30 * 1024 * 1024, null],
    ["วิดีโอเกินเพดาน", "video/mp4", 50 * 1024 * 1024 + 1, "file_too_big"],
    ["ชนิดไม่รองรับ", "application/x-msdownload", 10, "file_type"],
    ["ไฟล์ว่าง", "image/jpeg", 0, "file_empty"],
  ])("%s → %p", (_label, mime, size, expected) => expect(validateUpload(mime, size)).toBe(expected));
});

describe("uploadDir", () => {
  test("ค่าเริ่มต้น ./data/uploads และ override ด้วย UPLOAD_DIR", () => {
    const prev = process.env.UPLOAD_DIR;
    delete process.env.UPLOAD_DIR;
    expect(uploadDir().replace(/\\/g, "/")).toMatch(/\/data\/uploads$/);
    process.env.UPLOAD_DIR = "/srv/files";
    expect(uploadDir()).toBe("/srv/files");
    if (prev === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = prev;
  });
});
