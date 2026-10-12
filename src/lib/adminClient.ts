// ฝั่ง browser — ตัวช่วยเรียก API ของคอนโซลไอที และจัดรูปแบบข้อมูล
import { CATEGORIES } from "./categories";
import type { Lang } from "./i18n";

export class ApiError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

export async function api<T>(path: string, init: { method?: string; json?: unknown } = {}): Promise<T> {
  const hasBody = init.json !== undefined;
  const res = await fetch(path, {
    method: init.method ?? (hasBody ? "POST" : "GET"),
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(init.json) : undefined,
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) throw new ApiError(res.status);
  return (await res.json()) as T;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** วันนี้แสดง HH:mm, วันอื่นแสดง dd/MM HH:mm — จัดรูปแบบเอง เพราะ Intl ภาษาลาวใช้ไม่ได้ในบางเบราว์เซอร์ */
export function fmtTime(sec: number): string {
  if (!sec) return "";
  const d = new Date(sec * 1000);
  const now = new Date();
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  return sameDay ? hm : `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${hm}`;
}

// Array.from แยกตามตัวอักษรจริง (รวมอีโมจิ/อักษรลาว-ไทย) ไม่ตัดครึ่งตัวอักษร
export const initialOf = (name: string) => (Array.from(name.trim())[0] ?? "?").toUpperCase();

const URGENT = { lo: "ດ່ວນ", en: "Urgent" } as const;

/** ชื่อที่อ่านง่ายของป้ายกำกับ เช่น cosi-network → "Wi-Fi / ອິນເຕີເນັດ" */
export function labelName(title: string, lang: Lang): string {
  if (title === "cosi-urgent") return URGENT[lang];
  const cat = CATEGORIES.find((c) => `cosi-${c.id}` === title);
  return cat ? cat.label[lang] : title;
}
