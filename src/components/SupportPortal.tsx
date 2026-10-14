"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CATEGORIES, DEPARTMENTS, categoryLabel } from "@/lib/categories";
import type { MsgKey } from "@/lib/i18n";
import { getProfile, saveProfile, subscribeProfile } from "@/lib/profileStore";
import {
  identify,
  loadChatwoot,
  resetChatwoot,
  setChatMeta,
  setWidgetLocale,
  type ChatwootSdk,
  type Profile,
} from "@/lib/widget";
import { StaffHeader } from "./StaffHeader";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";

type Props = { baseUrl: string; websiteToken: string; initialLang: "lo" | "en" };

export default function SupportPortal({ initialLang, ...rest }: Props) {
  return (
    <I18nProvider initial={initialLang}>
      <Portal {...rest} />
    </I18nProvider>
  );
}

const HERO_STEPS: MsgKey[] = ["heroStep1", "heroStep2", "heroStep3"];

function Portal({ baseUrl, websiteToken }: Omit<Props, "initialLang">) {
  const { t, lang } = useI18n();
  // undefined = ยังไม่ hydrate, null = ยังไม่เคยกรอกข้อมูล
  const profile = useSyncExternalStore(subscribeProfile, getProfile, () => undefined);
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [phase, setPhase] = useState<"idle" | "connecting" | "error">("idle");
  const [cw, setCw] = useState<ChatwootSdk | null>(null);
  const firstLang = useRef(lang);

  // โหลด widget ไว้ล่วงหน้า (ซ่อน bubble) เพื่อให้กดปุ่มแล้วเปิดทันที
  useEffect(() => {
    if (!websiteToken) return;
    let live = true;
    loadChatwoot({ baseUrl, websiteToken, lang: firstLang.current })
      .then((sdk) => live && setCw(sdk))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [baseUrl, websiteToken]);

  useEffect(() => {
    if (cw && profile) identify(cw, profile);
  }, [cw, profile]);

  useEffect(() => {
    if (cw) setWidgetLocale(lang);
  }, [cw, lang]);

  const ready = Boolean(profile) && !editing;

  async function startChat() {
    if (!profile || !category) return;
    setPhase("connecting");
    try {
      const sdk = cw ?? (await loadChatwoot({ baseUrl, websiteToken, lang }));
      identify(sdk, profile);
      setChatMeta({ category, label: categoryLabel(category), urgent });
      sdk.toggle("open");
      setPhase("idle");
    } catch {
      setPhase("error");
    }
  }

  function switchUser() {
    resetChatwoot();
    saveProfile(null);
    setCategory(null);
    setUrgent(false);
    setEditing(false);
  }

  const startDisabled = !ready || !category || !websiteToken || phase === "connecting";
  const startLabel = !category && ready ? t("pickTopicFirst") : phase === "connecting" ? t("connecting") : t("startChat");

  return (
    <div className="min-h-screen">
      <StaffHeader title={t("heroTitle")} subtitle={t("heroSub")} backHref="/start" steps={HERO_STEPS.map((k) => t(k))} />

      {/* relative z-10: ให้การ์ดลอยทับขอบล่างของส่วนหัวที่มีเลเยอร์แสง (ไม่ให้ส่วนหัวบังหัวข้อ) */}
      <main className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-4 px-4 pb-10">
        <section className="card space-y-6 p-5 sm:p-6">
          {/* ขั้น 1: ผู้ใช้ */}
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
                      {[
                        DEPARTMENTS.find((d) => d.id === profile.department)?.label[lang] ?? profile.departmentLabel,
                        profile.contact,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={switchUser}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-deep-700 hover:bg-deep-100"
                >
                  {t("switchUser")}
                </button>
              </div>
            ) : (
              <ProfileForm
                onDone={() => setEditing(false)}
                onCancel={profile ? () => setEditing(false) : undefined}
              />
            )}
          </div>

          {/* ขั้น 2: หัวข้อปัญหา */}
          <div className={ready ? "" : "pointer-events-none opacity-50"} aria-disabled={!ready}>
            <h2 className="text-base font-semibold">{t("step2Title")}</h2>
            <p className="mt-0.5 text-sm text-stone-500">{t("step2Hint")}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => {
                const on = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!ready}
                    aria-pressed={on}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                      on
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                        : "border-stone-200 bg-white hover:border-brand-300 hover:bg-brand-50/50"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        on ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <Icon name={c.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug">{c.label[lang]}</span>
                      <span className="mt-0.5 block text-xs text-stone-500">{c.hint[lang]}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <label
              className={`mt-3 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                urgent ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-white hover:border-rose-200"
              }`}
            >
              <input
                type="checkbox"
                checked={urgent}
                disabled={!ready}
                onChange={(e) => setUrgent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-rose-600"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                  <Icon name="alert" className="h-4 w-4" />
                  {t("urgentLabel")}
                </span>
                <span className="mt-0.5 block text-xs text-stone-500">{t("urgentHint")}</span>
              </span>
            </label>
          </div>

          {/* ปุ่มเริ่มแชท */}
          <div>
            <button
              type="button"
              onClick={startChat}
              disabled={startDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-stone-300 disabled:via-stone-300 disabled:to-stone-300 disabled:shadow-none"
            >
              <Icon name="chat" className="h-5 w-5" />
              {startLabel}
            </button>
            {!websiteToken ? (
              <p role="alert" className="mt-2 text-sm text-rose-600">
                {t("notConfigured")}
              </p>
            ) : phase === "error" ? (
              <p role="alert" className="mt-2 text-sm text-rose-600">
                {t("chatError")}
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-stone-500">{t("chatHint")}</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export function ProfileForm({ onDone, onCancel }: { onDone: () => void; onCancel?: () => void }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<MsgKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("errNameRequired");
    if (!department) return setError("errDeptRequired");
    setError(null);
    setBusy(true);
    try {
      const r = await fetch("/api/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, department, contact }),
      });
      if (!r.ok) throw new Error(String(r.status));
      saveProfile((await r.json()) as Profile);
      onDone();
    } catch {
      setError("errSaveFailed");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:py-2 md:text-sm";

  return (
    <form onSubmit={submit} className="mt-2 space-y-3">
      <p className="text-sm text-stone-500">{t("step1Hint")}</p>
      <label className="block text-sm font-medium">
        {t("fieldName")}
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          {t("fieldDept")}
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={field}>
            <option value="">{t("deptPlaceholder")}</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          {t("fieldContact")}
          <input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={40} inputMode="tel" className={field} />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {t(error)}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-deep-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-deep-800 disabled:opacity-60"
        >
          {busy ? t("saving") : t("saveProfile")}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
