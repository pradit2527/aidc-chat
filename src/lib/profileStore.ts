// เก็บข้อมูลผู้ใช้ใน localStorage ของเครื่องนี้ — ใช้กับ useSyncExternalStore เพื่อไม่ให้ hydration ไม่ตรงกัน
import type { Profile } from "./widget";

const KEY = "cosi-support.profile";
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedValue: Profile | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null; // private mode / ถูกบล็อก — หน้ายังต้องทำงานได้
  }
}

export function getProfile(): Profile | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    cachedValue = raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

export function saveProfile(p: Profile | null) {
  try {
    if (p) window.localStorage.setItem(KEY, JSON.stringify(p));
    else window.localStorage.removeItem(KEY);
  } catch {
    // เขียนไม่ได้ก็ข้าม — ผู้ใช้จะต้องกรอกใหม่รอบหน้า
  }
  listeners.forEach((l) => l());
}

export function subscribeProfile(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
