"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, fmtTime, initialOf, labelName } from "@/lib/adminClient";
import type { AdminUser, ConversationDTO } from "@/lib/adminTypes";
import { DEPARTMENTS } from "@/lib/categories";
import { LANGS } from "@/lib/i18n";
import type { ReportDTO } from "@/lib/reports";
import { AidcLogo } from "./AidcLogo";
import { useI18n } from "./I18n";
import { Icon } from "./Icon";

type ReportsRes = { enabled: boolean; summary: { new: number; inProgress: number; done: number }; reports: ReportDTO[] };
const MAX_ROWS = 10;

/**
 * หน้าหลักของทีมไอที (หลังล็อกอิน): เลือก "ระบบแชท" หรือ "แจ้งปัญหา" + สรุปรายการที่ยังค้าง
 * กดรายการใดก็กระโดดเข้าหน้านั้นพร้อมเปิดเคส/งานนั้นทันที (/admin/chat?c=<id>, /admin/reports?r=<id>)
 */
export default function AdminHub({ user, onSignedOut }: { user: AdminUser; onSignedOut: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [chats, setChats] = useState<ConversationDTO[] | null>(null);
  const [reports, setReports] = useState<ReportsRes | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, rNew, rProg] = await Promise.all([
        api<{ conversations: ConversationDTO[] }>("/api/admin/conversations?status=open"),
        api<ReportsRes>("/api/admin/reports?status=new"),
        api<ReportsRes>("/api/admin/reports?status=in_progress"),
      ]);
      // แชทที่ลูกค้ารอตอบขึ้นก่อน แล้วเรียงตามกิจกรรมล่าสุด
      setChats([...c.conversations].sort((a, b) => Number(b.unread > 0) - Number(a.unread > 0) || b.updatedAt - a.updatedAt));
      setReports({ ...rNew, reports: [...rNew.reports, ...rProg.reports] });
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const id = setInterval(() => void load(), 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  async function signOut() {
    try {
      await api("/api/admin/logout", { json: {} });
    } catch {
      // ไม่เป็นไร คุกกี้อาจหมดอายุไปแล้ว
    }
    onSignedOut();
  }

  const waiting = chats?.filter((c) => c.unread > 0).length ?? 0;
  const newReports = reports?.enabled ? reports.summary.new : 0;
  const pendingReports = reports?.enabled ? reports.summary.new + reports.summary.inProgress : 0;
  const dept = (id: string) => DEPARTMENTS.find((d) => d.id === id)?.label[lang] ?? id;

  return (
    <div className="min-h-screen">
      <header className="hero text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <AidcLogo className="h-11" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold">{t("admTitle")}</div>
                <div className="text-xs text-white/75">{t("admBrand")}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a href="/admin/stats" className="hidden h-9 place-items-center rounded-full bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20 sm:grid">
                {t("admStats")}
              </a>
              <a href="/" target="_blank" rel="noreferrer" className="hidden h-9 place-items-center rounded-full bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20 sm:grid">
                QR
              </a>
              <div className="flex rounded-full bg-white/15 p-0.5 ring-1 ring-white/25" role="group" aria-label="Language">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLang(l.id)}
                    aria-pressed={lang === l.id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${lang === l.id ? "bg-white text-deep-800" : "text-white/90 hover:bg-white/10"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <span className="hidden text-sm text-white/90 md:block">{user.name}</span>
              <button
                type="button"
                onClick={signOut}
                title={t("admSignOut")}
                aria-label={t("admSignOut")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("ahTitle")}</h1>
          <span aria-hidden className="mt-2.5 block h-1 w-12 rounded-full bg-brand-500" />
          <p className="mt-3 text-sm text-white/90">{t("ahSub", { name: user.name })}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-8 grid max-w-6xl gap-4 px-4 pb-10">
        {/* สองเมนูหลัก */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Choice href="/admin/chat" n={1} icon="chat" title={t("ahChat")} hint={t("ahChatHint")} badge={waiting} badgeLabel={t("ahWaiting")} cta={t("hubGo")} />
          <Choice href="/admin/reports" n={2} icon="clipboard" title={t("ahReports")} hint={t("ahReportsHint")} badge={newReports} badgeLabel={t("rcTabNew")} cta={t("hubGo")} />
        </div>

        {error && (
          <p role="alert" className="card p-4 text-sm text-rose-700">
            {t("admLoadErr")}
          </p>
        )}

        {/* สรุปรายการค้าง */}
        <div className="grid gap-4 lg:grid-cols-2">
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
                        <span className="block truncate text-xs text-stone-500">
                          {[c.subtitle, c.preview].filter(Boolean).join(" · ")}
                        </span>
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
}: {
  href: string;
  n: number;
  icon: "chat" | "clipboard";
  title: string;
  hint: string;
  badge: number;
  badgeLabel: string;
  cta: string;
}) {
  return (
    <Link href={href} className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-deep-800/10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-deep-700 text-white transition group-hover:bg-brand-600">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">{n}</span>
        {badge > 0 && (
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
