"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useLive } from "@/lib/useLive";

/**
 * ทำให้หน้าที่ render ฝั่งเซิร์ฟเวอร์ (เช่น /admin/stats) อัปเดตเองโดยไม่ต้องกดรีเฟรช:
 * เรียก router.refresh() ทุก intervalMs และเมื่อสลับกลับมาที่แท็บ (ดึงข้อมูลใหม่โดยไม่โหลดหน้าซ้ำ)
 */
export function AutoRefresh({ intervalMs = 15_000, label }: { intervalMs?: number; label?: string }) {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  useLive(refresh, intervalMs);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}
