"use client";

import Link from "next/link";
import { useState } from "react";
import { DEPARTMENTS } from "@/lib/categories";
import type { Lang, MsgKey } from "@/lib/i18n";
import { saveProfile } from "@/lib/profileStore";
import type { Profile } from "@/lib/widget";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";

type Mode = "login" | "register";

/** หน้าล็อกอิน / ลงทะเบียนของพนักงาน — ปลายทางของ QR; สำเร็จแล้วไป `next` (ค่าเริ่มต้น /start) */
export default function AuthForm({ mode, next, initialLang }: { mode: Mode; next: string; initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <Form mode={mode} next={next} />
    </I18nProvider>
  );
}

const ERRORS: Record<string, MsgKey> = {
  invalid_credentials: "errBadLogin",
  too_many_attempts: "errTooMany",
  username_invalid: "errUsernameInvalid",
  password_invalid: "errPasswordInvalid",
  username_taken: "errUsernameTaken",
  name_required: "errNameRequired",
  department_required: "errDeptRequired",
};

function Form({ mode, next }: { mode: Mode; next: string }) {
  const { t, lang } = useI18n();
  const register = mode === "register";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<MsgKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!username.trim()) return setError("errUsernameRequired");
    if (!password) return setError("errPasswordRequired");
    if (register) {
      if (password.length < 6) return setError("errPasswordInvalid");
      if (password !== password2) return setError("errPasswordMismatch");
      if (!name.trim()) return setError("errNameRequired");
      if (!department) return setError("errDeptRequired");
    }
    setError(null);
    setBusy(true);
    try {
      const r = await fetch(register ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(register ? { username, password, name, department, contact } : { username, password }),
      });
      const data = (await r.json().catch(() => ({}))) as { profile?: Profile; error?: string };
      if (!r.ok || !data.profile) {
        setError(ERRORS[data.error ?? ""] ?? "errServer");
        return;
      }
      saveProfile(data.profile);
      // โหลดเต็มหน้า เพื่อให้เซิร์ฟเวอร์อ่านคุกกี้ใหม่และ render หน้าปลายทางด้วยข้อมูลผู้ใช้
      window.location.assign(next);
    } catch {
      setError("errServer");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:py-2 md:text-sm";
  const other = register ? "/login" : "/register";
  const otherHref = next === "/start" ? other : `${other}?next=${encodeURIComponent(next)}`;

  return (
    <div className="min-h-screen">
      <StaffHeader title={register ? t("registerTitle") : t("loginTitle")} subtitle={register ? t("registerSub") : t("loginSub")} />
      <main className="relative z-10 mx-auto -mt-8 max-w-md px-4 pb-10">
        <form onSubmit={submit} className="card space-y-4 p-5 sm:p-6" noValidate>
          <label className="block text-sm font-medium">
            {t("fieldUsername")}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={40}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={field}
            />
            {register && <span className="mt-1 block text-xs font-normal text-stone-500">{t("usernameHint")}</span>}
          </label>

          <label className="block text-sm font-medium">
            {t("fieldPassword")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              autoComplete={register ? "new-password" : "current-password"}
              className={field}
            />
            {register && <span className="mt-1 block text-xs font-normal text-stone-500">{t("passwordHint")}</span>}
          </label>

          {register && (
            <>
              <label className="block text-sm font-medium">
                {t("fieldPassword2")}
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  maxLength={100}
                  autoComplete="new-password"
                  className={field}
                />
              </label>
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
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {t(error)}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-60"
          >
            <Icon name={register ? "plus" : "lock"} className="h-5 w-5" />
            {register ? (busy ? t("registering") : t("registerBtn")) : busy ? t("loggingIn") : t("loginBtn")}
          </button>

          <div className="border-t border-stone-200 pt-4 text-center text-sm text-stone-600">
            {register ? t("haveAccount") : t("noAccount")}{" "}
            <Link href={otherHref} className="font-semibold text-deep-700 underline-offset-2 hover:underline">
              {register ? t("loginBtn") : t("registerBtn")}
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
