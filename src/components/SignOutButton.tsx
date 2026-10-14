"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/adminClient";
import { Icon } from "./Icon";

/** ปุ่มออกจากระบบสำหรับหน้าฝั่งแอดมินที่ไม่ได้อยู่ใน AdminApp (งานแจ้ง, สถิติ) — ลบคุกกี้แล้วกลับไปหน้าล็อกอิน */
export function SignOutButton({
  label,
  className = "",
  variant = "dark",
}: {
  label: string;
  className?: string;
  /** dark = บนแถบสีเข้ม, light = บนพื้นขาว */
  variant?: "dark" | "light";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      await api("/api/admin/logout", { json: {} });
    } catch {
      // คุกกี้อาจหมดอายุแล้ว — ไปหน้าล็อกอินต่อได้เลย
    }
    router.replace("/admin");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 transition disabled:opacity-50 ${
        variant === "light" ? "bg-stone-100 text-stone-700 ring-stone-200 hover:bg-stone-200" : "bg-white/10 ring-white/20 hover:bg-white/20"
      } ${className}`}
    >
      <Icon name="logout" className="h-4 w-4" />
    </button>
  );
}
