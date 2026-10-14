"use client";

import { useEffect } from "react";

/**
 * โหลดข้อมูลให้ "สด" โดยไม่ต้องกดรีเฟรช: โหลดทันทีตอนเปิด, โหลดซ้ำทุก intervalMs (เฉพาะตอนแท็บมองเห็น)
 * และโหลดทันทีเมื่อผู้ใช้สลับกลับมาที่แท็บ/หน้าต่าง — `load` ควรห่อด้วย useCallback
 */
export function useLive(load: () => unknown, intervalMs: number) {
  useEffect(() => {
    const run = () => {
      if (document.visibilityState === "visible") void load();
    };
    const first = window.setTimeout(run, 0);
    const timer = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("focus", run);
    };
  }, [load, intervalMs]);
}
