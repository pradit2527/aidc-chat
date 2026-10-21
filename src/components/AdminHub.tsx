"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { api, fmtTime, initialOf, labelName } from "@/lib/adminClient";
import type { AdminUser, ConversationDTO } from "@/lib/adminTypes";
import { DEPARTMENTS } from "@/lib/categories";
import type { ReportDTO } from "@/lib/reports";
import { useLive } from "@/lib/useLive";
import { AdminHeader } from "./AdminHeader";
import { useI18n } from "./I18n";
import { Icon } from "./Icon";

type ReportsRes = { enabled: boolean; summary: { new: number; inProgress: number; done: number }; reports: ReportDTO[] };
type WaRes = { db: boolean; device: { enabled: boolean; status: string; group: string | null } };
const MAX_ROWS = 10;

/**
 * หน้าหลักของทีมไอที (หลังล็อกอิน): การ์ด "ระบบแชท" (เฉพาะเมื่อ chat=true — ค่าปกติซ่อน ผู้ใช้สั่ง), "แจ้งปัญหา", "บัญชีผู้ใช้"
 * + แถบสถานะแจ้งเตือน WhatsApp + สรุปรายการที่ยังค้าง — กดรายการใดก็กระโดดเข้าหน้านั้นพร้อมเปิดเคส/งานนั้นทันที (?c= / ?r=)
 * แอดมินในระบบเองที่ไม่มี CHATWOOT_AGENT_TOKEN (user.local && !user.chat) ใช้แชทไม่ได้ — การ์ดแชทแสดงจาง
 */
export default function AdminHub({ user, onSignedOut, chat = false }: { user: AdminUser; onSignedOut: () => void; chat?: boolean }) {
  const { t, lang } = useI18n();
  const [chats, setChats] = useState<ConversationDTO[] | null>(null);
  const [reports, setReports] = useState<ReportsRes | null>(null);
  const [wa, setWa] = useState<WaRes | null>(null);
  const [error, setError] = useState(false);

  const noChat = user.local && !user.chat;
  const showChat = chat && !noChat;

  const load = useCallback(async () => {
    try {
      const [c, rNew, rProg, w] = await Promise.all([
        showChat ? api<{ conversations: ConversationDTO[] }>("/api/admin/conversations?status=open") : Promise.resolve({ conversations: [] as ConversationDTO[] }),
        api<ReportsRes>("/api/admin/reports?status=new"),
        api<ReportsRes>("/api/admin/reports?status=in_progress"),
        api<WaRes>("/api/admin/whatsapp?summary=1").catch(() => null),
      ]);
      // แชทที่ลูกค้ารอตอบขึ้นก่อน แล้วเรียงตามกิจกรรมล่าสุด
      setChats([...c.conversations].sort((a, b) => Number(b.unread > 0) - Number(a.unread > 0) || b.updatedAt - a.updatedAt));
      setReports({ ...rNew, reports: [...rNew.reports, ...rProg.reports] });
      setWa(w);
      setError(false);
    } catch {
      setError(true);
    }
  }, [showChat]);

  useLive(load, 5_000);

  const waiting = chats?.filter((c) => c.unread > 0).length ?? 0;
  const newReports = reports?.enabled ? reports.summary.new : 0;
  const pendingReports = reports?.enabled ? reports.summary.new + reports.summary.inProgress : 0;
  const dept = (id: string) => DEPARTMENTS.find((d) => d.id === id)?.label[lang] ?? id;

  // แจ้งเตือนกลุ่ม WhatsApp ทำงานเบื้องหลัง (ผู้ใช้ไม่ต้องการเห็นหน้าตั้งค่า) — แสดงแถบเหลืองเฉพาะตอนหลุด/ยังไม่ได้สแกน
  // ให้กดไป /admin/whatsapp สแกน QR ใหม่ (หน้านั้นไม่มีในเมนู)
  const waAlert =
    wa && wa.db && wa.device.enabled && !(wa.device.status === "open" && wa.device.group) ? { ok: false, text: t("waHubAlertGroup") } : null;

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} title={t("ahTitle")} subtitle={t(chat ? "ahSub" : "ahSubReport", { name: user.name })} hideHome onSignedOut={onSignedOut} />

      <main className="relative z-10 mx-auto -mt-8 grid max-w-6xl gap-4 px-4 pb-10">
        {/* เมนูหลัก */}
        <div className={`grid gap-4 ${chat ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {chat && (
            <Choice
              href="/admin/chat"
              n={1}
              icon="chat"
              title={t("ahChat")}
              hint={noChat ? t("ahChatNeedsCw") : t("ahChatHint")}
              badge={waiting}
              badgeLabel={t("ahWaiting")}
              cta={t("hubGo")}
              disabled={noChat}
            />
          )}
          <Choice href="/admin/reports" n={chat ? 2 : 1} icon="clipboard" title={t("ahReports")} hint={t("ahReportsHint")} badge={newReports} badgeLabel={t("rcTabNew")} cta={t("hubGo")} />
          <Choice href="/admin/users" n={chat ? 3 : 2} icon="user" title={t("admUsers")} hint={t("ahUsersHint")} cta={t("hubGo")} />
        </div>

        {error && (
          <p role="alert" className="card p-4 text-sm text-rose-700">
            {t("admLoadErr")}
          </p>
        )}

        {/* แจ้งเตือน WhatsApp: ยังไม่พร้อม (ยังไม่สแกน/ยังไม่เลือกกลุ่ม) → เตือนสีเหลือง; พร้อม → สีเขียวบอกกลุ่ม */}
        {waAlert && (
          <Link
            href="/admin/whatsapp"
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ring-1 transition ${
              waAlert.ok ? "bg-emerald-50 text-emerald-800 ring-emerald-100 hover:bg-emerald-100" : "bg-amber-50 text-amber-900 ring-amber-200 hover:bg-amber-100"
            }`}
          >
            <Icon name="bell" className="h-4 w-4 shrink-0" />
            {waAlert.text}
            <Icon name="chevron" className="ml-auto h-4 w-4 -rotate-90" />
          </Link>
        )}

        {/* สรุปรายการค้าง */}
        <div className={`grid gap-4 ${showChat ? "lg:grid-cols-2" : ""}`}>
          {showChat && (
            <section className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="chat" className="h-4 w-4 text-deep-700" />
                  {t("ahOpenChats")}
                  {chats && <span className="text-xs font-normal text-stone-500">({chats.length})</span>}
                </h2>
                <Link href="/admin/chat" className="text-xs font-semibold text-brand-700 hover:underline">
                  {t("ahViewAll")}
                </Link>
              </div>
              {!chats ? (
                <div className="mt-3 h-10 animate-pulse rounded-xl bg-stone-100" />
              ) : chats.length === 0 ? (
                <p className="mt-3 text-sm text-stone-400">{t("ahEmptyChats")}</p>
              ) : (
                <ul className="mt-2 divide-y divide-stone-100">
                  {chats.slice(0, MAX_ROWS).map((c) => (
                    <li key={c.id}>
                      <Link href={`/admin/chat?c=${c.id}`} className="flex items-center gap-3 py-2.5 hover:bg-stone-50">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep-700 text-sm font-bold text-white">{initialOf(c.name)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className={`truncate text-sm ${c.unread ? "font-bold" : "font-semibold"}`}>{c.name}</span>
                            {c.ticket && <span className="shrink-0 text-[11px] tabular-nums text-brand-700">{c.ticket}</span>}
                          </span>
                          <span className="block truncate text-xs text-stone-500">{[c.subtitle, c.preview].filter(Boolean).join(" · ")}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-[11px] tabular-nums text-stone-500">{fmtTime(c.updatedAt)}</span>
                          {c.unread > 0 && (
                            <span className="unread-badge inline-grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">{c.unread}</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="clipboard" className="h-4 w-4 text-deep-700" />
                {t("ahOpenReports")}
                {reports && <span className="text-xs font-normal text-stone-500">({pendingReports})</span>}
              </h2>
              <Link href="/admin/reports" className="text-xs font-semibold text-brand-700 hover:underline">
                {t("ahViewAll")}
              </Link>
            </div>
            {!reports ? (
              <div className="mt-3 h-10 animate-pulse rounded-xl bg-stone-100" />
            ) : !reports.enabled ? (
              <p className="mt-3 text-sm text-rose-700">{t("rcNoDb")}</p>
            ) : reports.reports.length === 0 ? (
              <p className="mt-3 text-sm text-stone-400">{t("ahEmptyReports")}</p>
            ) : (
              <ul className="mt-2 divide-y divide-stone-100">
                {reports.reports.slice(0, MAX_ROWS).map((r) => {
                  const done = r.items.filter((i) => i.done).length;
                  return (
                    <li key={r.id}>
                      <Link href={`/admin/reports?r=${r.id}`} className="flex items-center gap-3 py-2.5 hover:bg-stone-50">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep-700 text-sm font-bold text-white">{initialOf(r.name)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-sm font-semibold">{r.name}</span>
                            <span className="text-[11px] tabular-nums text-brand-700">{r.ticketNo}</span>
                            <span className={`rounded-full px-1.5 text-[10px] font-semibold ${r.status === "new" ? "bg-red-50 text-red-700" : "bg-amber-100 text-amber-900"}`}>
                              {r.status === "new" ? t("rcTabNew") : t("rcTabProgress")}
                            </span>
                            {r.urgent && <span className="rounded-full bg-rose-50 px-1.5 text-[10px] font-semibold text-rose-700">{t("admUrgent")}</span>}
                          </span>
                          <span className="block truncate text-xs text-stone-500">
                            {[dept(r.department), [...new Set(r.items.map((i) => labelName(`cosi-${i.topic}`, lang)))].join(", ")].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-stone-500">
                          <span className="tabular-nums">{fmtTime(r.createdAt)}</span>
                          <span>{t("rcItemsDone", { done, total: r.items.length })}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Choice({
  href,
  n,
  icon,
  title,
  hint,
  badge,
  badgeLabel,
  cta,
  disabled,
}: {
  href: string;
  n: number;
  icon: "chat" | "clipboard" | "user";
  title: string;
  hint: string;
  badge?: number;
  badgeLabel?: string;
  cta: string;
  /** ปิดเมนูนี้ (แสดงจาง ไม่ลิงก์) */
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div aria-disabled="true" className="card flex flex-col gap-4 p-6 opacity-60">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-stone-400 text-white">
            <Icon name={icon} className="h-6 w-6" />
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-400 text-xs font-bold text-white">{n}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-600">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">{hint}</p>
        </div>
      </div>
    );
  }
  return (
    <Link href={href} className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-deep-800/10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-deep-700 text-white transition group-hover:bg-brand-600">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">{n}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
            <span className="unread-badge inline-grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">{badge}</span>
            {badgeLabel}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-deep-800">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">{hint}</p>
      </div>
      <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition group-hover:brightness-110">
        {cta}
        <Icon name="chevron" className="h-4 w-4 -rotate-90" />
      </span>
    </Link>
  );
}
