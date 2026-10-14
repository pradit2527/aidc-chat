"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fmtTime, labelName } from "@/lib/adminClient";
import { DEPARTMENTS } from "@/lib/categories";
import type { Lang } from "@/lib/i18n";
import { getProfile } from "@/lib/profileStore";
import type { ReportDTO, ReportStatus as Status } from "@/lib/reports";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";

type View = Omit<ReportDTO, "note">;

/** พนักงานดูสถานะรายงานของตัวเอง (ต้องเป็นเครื่องที่ส่ง — ใช้ identifier ใน localStorage) */
export default function ReportStatus({ no, initialLang }: { no: string; initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <StatusView no={no} />
    </I18nProvider>
  );
}

const STEPS: Status[] = ["new", "in_progress", "done"];

function StatusView({ no }: { no: string }) {
  const { t, lang } = useI18n();
  const [state, setState] = useState<{ kind: "loading" } | { kind: "notfound" } | { kind: "ok"; report: View }>({ kind: "loading" });

  const load = useCallback(async () => {
    const who = getProfile()?.identifier ?? "";
    try {
      const r = await fetch(`/api/reports/${encodeURIComponent(no)}?who=${encodeURIComponent(who)}`, { cache: "no-store" });
      if (!r.ok) return setState({ kind: "notfound" });
      setState({ kind: "ok", report: ((await r.json()) as { report: View }).report });
    } catch {
      setState({ kind: "notfound" });
    }
  }, [no]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);
  useEffect(() => {
    if (state.kind === "ok" && state.report.status !== "done") {
      const id = setInterval(load, 20_000);
      return () => clearInterval(id);
    }
  }, [state, load]);

  const stepLabel = (s: Status) => (s === "new" ? t("rsStatusNew") : s === "in_progress" ? t("rsStatusProgress") : t("rsStatusDone"));

  return (
    <div className="min-h-screen">
      <StaffHeader title={t("rsTitle")} subtitle={no} backHref="/start" />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-4 px-4 pb-10">
        {state.kind === "loading" ? (
          <section className="card p-6 text-sm text-stone-500">{t("rsLoading")}</section>
        ) : state.kind === "notfound" ? (
          <section role="alert" className="card space-y-4 p-6 text-sm text-rose-700">
            <p>{t("rsNotFound")}</p>
            <Link href="/start" className="inline-block rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:brightness-110">
              {t("hubBack")}
            </Link>
          </section>
        ) : (
          <Report r={state.report} stepLabel={stepLabel} onRefresh={load} lang={lang} />
        )}
      </main>
    </div>
  );
}

function Report({ r, stepLabel, onRefresh, lang }: { r: View; stepLabel: (s: Status) => string; onRefresh: () => void; lang: Lang }) {
  const { t } = useI18n();
  const cur = STEPS.indexOf(r.status);
  const byTopic = new Map<string, View["items"]>();
  for (const i of r.items) byTopic.set(i.topic, [...(byTopic.get(i.topic) ?? []), i]);
  const dept = DEPARTMENTS.find((d) => d.id === r.department)?.label[lang] ?? r.department;

  return (
    <section className="card space-y-5 p-5 sm:p-6">
      {/* ขั้นสถานะ */}
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => {
          const done = i < cur || r.status === "done";
          const active = i === cur;
          return (
            <li key={s} className="text-center">
              <span
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold ring-2 ${
                  done ? "bg-emerald-600 text-white ring-emerald-200" : active ? "bg-brand-600 text-white ring-brand-200" : "bg-stone-100 text-stone-400 ring-stone-200"
                }`}
              >
                {done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`mt-1.5 block text-xs font-medium ${active || done ? "text-deep-800" : "text-stone-400"}`}>{stepLabel(s)}</span>
            </li>
          );
        })}
      </ol>

      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3 border-b border-stone-100 pb-2">
          <dt className="text-stone-500">{t("stColName")}</dt>
          <dd className="font-medium">
            {r.name}
            {dept && <span className="text-stone-500"> · {dept}</span>}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-stone-100 pb-2">
          <dt className="text-stone-500">{t("rsSentAt")}</dt>
          <dd className="font-medium tabular-nums">{fmtTime(r.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-stone-100 pb-2">
          <dt className="text-stone-500">{t("rsAssignee")}</dt>
          <dd className="font-medium">{r.assignee || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-stone-100 pb-2">
          <dt className="text-stone-500">{t("rsDoneAt")}</dt>
          <dd className="font-medium tabular-nums">{r.doneAt ? fmtTime(r.doneAt) : "—"}</dd>
        </div>
      </dl>

      <div className="space-y-3">
        {[...byTopic].map(([topic, items]) => (
          <div key={topic} className="rounded-xl border border-stone-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{labelName(`cosi-${topic}`, lang)}</h3>
              <span className="text-xs text-stone-500">{t("rcItemsDone", { done: items.filter((i) => i.done).length, total: items.length })}</span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {items.map((i) => (
                <li key={i.id} className={`flex items-start gap-2 text-sm ${i.done ? "text-stone-400 line-through" : ""}`}>
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${i.done ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                    {i.done ? <Icon name="check" className="h-3 w-3" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{i.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {r.urgent && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-700">
          <Icon name="alert" className="h-4 w-4" />
          {t("urgentLabel")}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRefresh} className="rounded-full bg-deep-50 px-4 py-2 text-sm font-semibold text-deep-800 ring-1 ring-deep-100 hover:bg-deep-100">
          {t("rsRefresh")}
        </button>
        <Link href="/start" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:brightness-110">
          {t("hubBack")}
        </Link>
      </div>
    </section>
  );
}
