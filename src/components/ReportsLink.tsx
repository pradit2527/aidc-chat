"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/adminClient";
import { useLive } from "@/lib/useLive";

/** ปุ่ม "ງານແຈ້ງ" ที่หัวคอนโซลแชท — โพลล์จำนวนงานใหม่ทุก 10 วินาที (และเมื่อกลับมาที่แท็บ) แสดงเป็นตัวเลขแดง */
export function ReportsLink({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  const load = useCallback(
    () =>
      api<{ enabled: boolean; summary: { new: number } }>("/api/admin/reports?summary=1")
        .then((r) => setCount(r.enabled ? r.summary.new : 0))
        .catch(() => {}),
    [],
  );
  useLive(load, 10_000);
  return (
    <a
      href="/admin/reports"
      title={label}
      className="relative hidden h-9 place-items-center rounded-full bg-white/10 px-2.5 text-xs font-bold ring-1 ring-white/20 transition hover:bg-white/20 sm:grid"
    >
      {label}
      {count > 0 && (
        <span className="unread-badge absolute -right-1.5 -top-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm shadow-red-600/40">
          {count}
        </span>
      )}
    </a>
  );
}
