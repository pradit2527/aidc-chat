"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { fmtTime } from "@/lib/adminClient";
import type { Lang } from "@/lib/i18n";
import { emptyMyReports, readMyReports, subscribeMyReports } from "@/lib/myReports";
import { getProfile, subscribeProfile } from "@/lib/profileStore";
import type { OwnerReportRow, ReportStatus } from "@/lib/reports";
import { useLive } from "@/lib/useLive";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";

/** หน้าหลักของพนักงาน (ปลายทาง QR): เลือก "ระบบแชท" หรือ "แจ้งปัญหา" + รายงานของฉัน (สถานะ, ผู้รับเรื่อง, หน้าละ 30) */
export default function StartHub({ initialLang }: { initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <Hub />
    </I18nProvider>
  );
}

type MineRes = { enabled: boolean; reports: OwnerReportRow[]; total: number; page: number; pages: number };

function Hub() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen">
      <StaffHeader title={t("hubTitle")} subtitle={t("hubSub")} steps={[t("hubChat"), t("hubReport")]} />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-4 px-4 pb-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <Choice href="/chat" n={1} icon="chat" title={t("hubChat")} hint={t("hubChatHint")} cta={t("hubGo")} />
          <Choice href="/report" n={2} icon="clipboard" title={t("hubReport")} hint={t("hubReportHint")} cta={t("hubGo")} />
        </div>
        <MyReports />
      </main>
    </div>
  );
}

/** รายงานของฉัน — ดึงจากเซิร์ฟเวอร์ด้วย identifier ของผู้ใช้ (เห็นครบทุกเครื่องที่ใช้ชื่อ/แผนกเดิม); ไม่มีโปรไฟล์ → ใช้รายการในเครื่อง */
function MyReports() {
  const { t } = useI18n();
  const profile = useSyncExternalStore(subscribeProfile, getProfile, () => undefined);
  const local = useSyncExternalStore(subscribeMyReports, readMyReports, emptyMyReports);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MineRes | null>(null);
  const who = profile?.identifier ?? "";

  const load = useCallback(async () => {
    if (!who) return;
    try {
      const r = await fetch(`/api/reports/mine?who=${encodeURIComponent(who)}&page=${page}`, { cache: "no-store" });
      if (r.ok) setData((await r.json()) as MineRes);
    } catch {
      // แสดงรายการในเครื่องแทน
    }
  }, [who, page]);

  useLive(load, 10_000);

  const statusText = (s: ReportStatus) => (s === "new" ? t("rsStatusNew") : s === "in_progress" ? t("rsStatusProgress") : t("rsStatusDone"));
  const statusCls = (s: ReportStatus) =>
    s === "done" ? "bg-emerald-50 text-emerald-700" : s === "in_progress" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600";

  // ยังไม่ hydrate / ไม่มีอะไรจะแสดง
  if (profile === undefined) return null;
  const serverList = data?.enabled ? data.reports : null;
  if (!serverList && local.length === 0) return null;
  if (serverList && serverList.length === 0 && local.length === 0) return null;

  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon name="list" className="h-4 w-4 text-deep-700" />
        {t("hubMyReports")}
        {data && data.total > 0 && <span className="text-xs font-normal text-stone-500">({data.total})</span>}
      </h2>

      {serverList ? (
        serverList.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">{t("hubNoReports")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100">
            {serverList.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/report/${encodeURIComponent(r.ticketNo)}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm hover:text-brand-700"
                >
                  <span className="font-semibold tabular-nums">{r.ticketNo}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCls(r.status)}`}>{statusText(r.status)}</span>
                  {r.urgent && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">{t("admUrgent")}</span>}
                  <span className="text-xs text-stone-500">
                    {t("hubAssignee")}: {r.assignee ? <span className="font-medium text-stone-700">{r.assignee}</span> : t("hubNoAssignee")}
                  </span>
                  <span className="text-xs text-stone-400">{t("rcItemsDone", { done: r.itemsDone, total: r.itemsTotal })}</span>
                  <span className="ml-auto text-xs tabular-nums text-stone-500">{fmtTime(r.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className="mt-3 divide-y divide-stone-100">
          {local.map((r) => (
            <li key={r.no}>
              <Link href={`/report/${encodeURIComponent(r.no)}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand-700">
                <span className="font-semibold tabular-nums">{r.no}</span>
                <span className="text-xs text-stone-500">{fmtTime(r.at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.pages > 1 && (
        <nav className="mt-3 flex items-center justify-between gap-2 text-sm" aria-label="pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded-full bg-deep-50 px-3 py-1.5 font-semibold text-deep-800 ring-1 ring-deep-100 hover:bg-deep-100 disabled:opacity-40"
          >
            <Icon name="chevron" className="h-4 w-4 rotate-90" />
            {t("hubPrev")}
          </button>
          <span className="text-xs text-stone-500">{t("hubPage", { page: data.page, pages: data.pages, total: data.total })}</span>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            className="flex items-center gap-1 rounded-full bg-deep-50 px-3 py-1.5 font-semibold text-deep-800 ring-1 ring-deep-100 hover:bg-deep-100 disabled:opacity-40"
          >
            {t("hubNext")}
            <Icon name="chevron" className="h-4 w-4 -rotate-90" />
          </button>
        </nav>
      )}
    </section>
  );
}

function Choice({
  href,
  n,
  icon,
  title,
  hint,
  cta,
}: {
  href: string;
  n: number;
  icon: "chat" | "clipboard";
  title: string;
  hint: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-deep-800/10"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-deep-700 text-white transition group-hover:bg-brand-600">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">{n}</span>
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
