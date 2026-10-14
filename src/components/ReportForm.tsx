"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { CATEGORIES, DEPARTMENTS } from "@/lib/categories";
import type { Lang } from "@/lib/i18n";
import { addMyReport } from "@/lib/myReports";
import { getProfile, saveProfile, subscribeProfile } from "@/lib/profileStore";
import { REPORT_LIMITS } from "@/lib/reports";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";
import { ProfileForm } from "./SupportPortal";

type Props = { initialLang: Lang; enabled: boolean };

/** แจ้งปัญหาแบบรายการ: เลือกหัวข้อ → พิมพ์ปัญหาเป็นข้อ ๆ → ส่งให้ทีมไอที (ไม่ผ่านแชท) */
export default function ReportForm({ initialLang, enabled }: Props) {
  return (
    <I18nProvider initial={initialLang}>
      <Form enabled={enabled} />
    </I18nProvider>
  );
}

type Items = Record<string, string[]>;

function Form({ enabled }: { enabled: boolean }) {
  const { t, lang } = useI18n();
  const profile = useSyncExternalStore(subscribeProfile, getProfile, () => undefined);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [items, setItems] = useState<Items>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [urgent, setUrgent] = useState(false);
  const [phase, setPhase] = useState<"idle" | "sending" | "error">("idle");
  const [result, setResult] = useState<{ ticketNo: string; summary: { topic: string; items: string[] }[] } | null>(null);

  const ready = Boolean(profile) && !editing;
  const total = selected.reduce((n, id) => n + (items[id]?.length ?? 0), 0);

  function toggleTopic(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function addItem(id: string) {
    const text = (drafts[id] ?? "").replace(/\s+/g, " ").trim().slice(0, REPORT_LIMITS.itemLength);
    if (!text) return;
    setItems((m) => {
      const list = m[id] ?? [];
      if (list.length >= REPORT_LIMITS.itemsPerTopic) return m;
      return { ...m, [id]: [...list, text] };
    });
    setDrafts((d) => ({ ...d, [id]: "" }));
  }
  function removeItem(id: string, i: number) {
    setItems((m) => ({ ...m, [id]: (m[id] ?? []).filter((_, j) => j !== i) }));
  }
  function reset() {
    setSelected([]);
    setItems({});
    setDrafts({});
    setUrgent(false);
    setResult(null);
    setPhase("idle");
  }
  function switchUser() {
    saveProfile(null);
    reset();
    setEditing(false);
  }

  async function send() {
    if (!profile || total === 0 || phase === "sending") return;
    setPhase("sending");
    const topics = selected.filter((id) => items[id]?.length).map((id) => ({ topic: id, items: items[id] }));
    try {
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          department: profile.department,
          contact: profile.contact,
          identifier: profile.identifier,
          urgent,
          topics,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { ticketNo: string };
      addMyReport(j.ticketNo);
      setResult({ ticketNo: j.ticketNo, summary: topics });
      setPhase("idle");
    } catch {
      setPhase("error");
    }
  }

  const topicLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label[lang] ?? id;

  return (
    <div className="min-h-screen">
      <StaffHeader title={t("rpTitle")} subtitle={t("rpSub")} backHref="/start" />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-4 px-4 pb-10">
        {result ? (
          <section className="card space-y-5 p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <Icon name="check" className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-deep-800">{t("rpDoneTitle")}</h2>
              <p className="mt-1 text-sm text-stone-600">{t("rpDoneHint")}</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-brand-700">{result.ticketNo}</p>
            </div>
            <div className="mx-auto max-w-md rounded-xl bg-stone-50 p-4 text-left text-sm ring-1 ring-stone-200">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("rpSummary")}</div>
              {result.summary.map((s) => (
                <div key={s.topic} className="mb-2 last:mb-0">
                  <div className="font-semibold">{topicLabel(s.topic)}</div>
                  <ul className="ml-4 list-disc text-stone-700">
                    {s.items.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href={`/report/${encodeURIComponent(result.ticketNo)}`}
                className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:brightness-110"
              >
                {t("rpTrack")}
              </Link>
              <button type="button" onClick={reset} className="rounded-full bg-deep-50 px-5 py-2.5 text-sm font-semibold text-deep-800 ring-1 ring-deep-100 hover:bg-deep-100">
                {t("rpNew")}
              </button>
              <Link href="/start" className="rounded-full px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100">
                {t("hubBack")}
              </Link>
            </div>
          </section>
        ) : (
          <section className="card space-y-6 p-5 sm:p-6">
            {/* ขั้น 1: ผู้ใช้ (เหมือนหน้าแชท ใช้ข้อมูลชุดเดียวกัน) */}
            <div>
              <h2 className="text-base font-semibold">{t("step1Title")}</h2>
              {profile === undefined ? (
                <div className="mt-3 h-14 animate-pulse rounded-xl bg-stone-100" />
              ) : profile && !editing ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-deep-50 px-4 py-3 ring-1 ring-deep-100">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep-700 text-white">
                      <Icon name="user" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{t("hello", { name: profile.name })}</div>
                      <div className="truncate text-xs text-stone-500">
                        {[DEPARTMENTS.find((d) => d.id === profile.department)?.label[lang] ?? profile.departmentLabel, profile.contact]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={switchUser} className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-deep-700 hover:bg-deep-100">
                    {t("switchUser")}
                  </button>
                </div>
              ) : (
                <ProfileForm onDone={() => setEditing(false)} onCancel={profile ? () => setEditing(false) : undefined} />
              )}
            </div>

            {/* ขั้น 2: หัวข้อ + ข้อย่อย */}
            <div className={ready ? "" : "pointer-events-none opacity-50"} aria-disabled={!ready}>
              <h2 className="text-base font-semibold">{t("rpStep2")}</h2>
              <p className="mt-0.5 text-sm text-stone-500">{t("rpStep2Hint")}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORIES.map((c) => {
                  const on = selected.includes(c.id);
                  const n = items[c.id]?.length ?? 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={!ready}
                      aria-pressed={on}
                      onClick={() => toggleTopic(c.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        on ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200" : "border-stone-200 bg-white hover:border-brand-300 hover:bg-brand-50/50"
                      }`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${on ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600"}`}>
                        <Icon name={c.icon} className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="block text-sm font-semibold leading-snug">{c.label[lang]}</span>
                          {n > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">{n}</span>}
                        </span>
                        <span className="mt-0.5 block text-xs text-stone-500">{c.hint[lang]}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* รายการข้อย่อยของแต่ละหัวข้อที่เลือก */}
              {selected.map((id) => {
                const c = CATEGORIES.find((x) => x.id === id)!;
                const list = items[id] ?? [];
                return (
                  <div key={id} className="mt-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white">
                        <Icon name={c.icon} className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold">{c.label[lang]}</h3>
                      <span className="ml-auto text-xs text-stone-500">{t("rpItems", { n: list.length })}</span>
                    </div>
                    {list.length === 0 ? (
                      <p className="mt-2 text-xs text-stone-500">{t("rpNoItems")}</p>
                    ) : (
                      <ol className="mt-2 space-y-1.5">
                        {list.map((x, i) => (
                          <li key={i} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-deep-700 text-[11px] font-bold text-white">{i + 1}</span>
                            <span className="min-w-0 flex-1 break-words">{x}</span>
                            <button
                              type="button"
                              onClick={() => removeItem(id, i)}
                              aria-label={t("rpRemove")}
                              title={t("rpRemove")}
                              className="shrink-0 rounded-md p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                    <div className="mt-2 flex gap-2">
                      <input
                        value={drafts[id] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItem(id);
                          }
                        }}
                        maxLength={REPORT_LIMITS.itemLength}
                        placeholder={t("rpItemPlaceholder")}
                        aria-label={`${c.label[lang]} — ${t("rpAdd")}`}
                        className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:py-2 md:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => addItem(id)}
                        disabled={!(drafts[id] ?? "").trim()}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-deep-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-deep-800 disabled:opacity-40"
                      >
                        <Icon name="plus" className="h-4 w-4" />
                        {t("rpAdd")}
                      </button>
                    </div>
                  </div>
                );
              })}

              <label
                className={`mt-3 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  urgent ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-white hover:border-rose-200"
                }`}
              >
                <input type="checkbox" checked={urgent} disabled={!ready} onChange={(e) => setUrgent(e.target.checked)} className="mt-1 h-4 w-4 accent-rose-600" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                    <Icon name="alert" className="h-4 w-4" />
                    {t("urgentLabel")}
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">{t("urgentHint")}</span>
                </span>
              </label>
            </div>

            {/* ส่ง */}
            <div>
              <button
                type="button"
                onClick={send}
                disabled={!ready || total === 0 || !enabled || phase === "sending"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-stone-300 disabled:via-stone-300 disabled:to-stone-300 disabled:shadow-none"
              >
                <Icon name="send" className="h-5 w-5" />
                {phase === "sending" ? t("rpSending") : ready && total === 0 ? t("rpNeedItems") : `${t("rpSend")}${total ? ` (${t("rpItems", { n: total })})` : ""}`}
              </button>
              {!enabled ? (
                <p role="alert" className="mt-2 text-sm text-rose-600">
                  {t("rpNotAvailable")}{" "}
                  <Link href="/chat" className="font-semibold underline">
                    {t("hubChat")}
                  </Link>
                </p>
              ) : phase === "error" ? (
                <p role="alert" className="mt-2 text-sm text-rose-600">
                  {t("rpSendErr")}
                </p>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
