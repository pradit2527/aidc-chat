"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { fmtTime } from "@/lib/adminClient";
import type { Lang } from "@/lib/i18n";
import { emptyMyReports, readMyReports, subscribeMyReports } from "@/lib/myReports";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";

/** หน้าหลักของพนักงาน (ปลายทาง QR): เลือก "ระบบแชท" หรือ "แจ้งปัญหา" */
export default function StartHub({ initialLang }: { initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <Hub />
    </I18nProvider>
  );
}

function Hub() {
  const { t } = useI18n();
  // รายการรายงานของเครื่องนี้ (localStorage) — ฝั่งเซิร์ฟเวอร์เป็นรายการว่างเสมอ จึงไม่มี hydration mismatch
  const mine = useSyncExternalStore(subscribeMyReports, readMyReports, emptyMyReports);

  return (
    <div className="min-h-screen">
      <StaffHeader title={t("hubTitle")} subtitle={t("hubSub")} />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-4 px-4 pb-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <Choice href="/chat" n={1} icon="chat" title={t("hubChat")} hint={t("hubChatHint")} cta={t("hubGo")} />
          <Choice href="/report" n={2} icon="clipboard" title={t("hubReport")} hint={t("hubReportHint")} cta={t("hubGo")} />
        </div>

        {mine.length > 0 && (
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Icon name="list" className="h-4 w-4 text-deep-700" />
              {t("hubMyReports")}
            </h2>
            <ul className="mt-3 divide-y divide-stone-100">
              {mine.map((r) => (
                <li key={r.no}>
                  <Link
                    href={`/report/${encodeURIComponent(r.no)}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand-700"
                  >
                    <span className="font-semibold tabular-nums">{r.no}</span>
                    <span className="text-xs text-stone-500">{fmtTime(r.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
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
