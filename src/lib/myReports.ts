// รายการเลขรายงานที่ส่งจากเครื่องนี้ (localStorage) — ให้พนักงานกลับมาดูสถานะได้จากหน้าหลัก
// ใช้กับ useSyncExternalStore (snapshot ถูก cache ตามข้อความดิบ เพื่อไม่ให้ render วนซ้ำ)
const KEY = "cosi-support.reports";
const MAX = 20;

export type MyReport = { no: string; at: number };

const EMPTY: MyReport[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedList: MyReport[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function readMyReports(): MyReport[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    cachedList = Array.isArray(list)
      ? list.filter((x): x is MyReport => !!x && typeof x === "object" && typeof (x as MyReport).no === "string")
      : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

/** snapshot ฝั่งเซิร์ฟเวอร์/ก่อน hydrate = รายการว่าง */
export const emptyMyReports = () => EMPTY;

export function subscribeMyReports(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function addMyReport(no: string) {
  try {
    const list = [{ no, at: Math.floor(Date.now() / 1000) }, ...readMyReports().filter((r) => r.no !== no)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // private mode — ข้ามได้
  }
  listeners.forEach((l) => l());
}
