"use client";

import { useState } from "react";
import type { Lang, MsgKey } from "@/lib/i18n";
import { saveProfile } from "@/lib/profileStore";
import type { Profile } from "@/lib/widget";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";

/** หน้าล็อกอินของพนักงาน — ปลายทางของ QR; สำเร็จแล้วไป `next` (ค่าเริ่มต้น /start) · บัญชีสร้างโดยทีมไอทีที่ /admin/users */
export default function AuthForm({ next, initialLang, manager = false }: { next: string; initialLang: Lang; manager?: boolean }) {
  return (
    <I18nProvider initial={initialLang}>
      <Form next={next} manager={manager} />
    </I18nProvider>
  );
}

const ERRORS: Record<string, MsgKey> = {
  invalid_credentials: "errBadLogin",
  too_many_attempts: "errTooMany",
};

function Form({ next, manager }: { next: string; manager: boolean }) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<MsgKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!username.trim()) return setError("errUsernameRequired");
    if (!password) return setError("errPasswordRequired");
    setError(null);
    setBusy(true);
    try {
      const r = await fetch(manager ? "/api/manager/login" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await r.json().catch(() => ({}))) as { profile?: Profile; ok?: boolean; error?: string };
      if (!r.ok || !(manager ? data.ok : data.profile)) {
        setError(ERRORS[data.error ?? ""] ?? "errServer");
        return;
      }
      if (data.profile) saveProfile(data.profile);
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

  return (
    <div className="min-h-screen">
      <StaffHeader title={manager ? t("mgrLoginTitle") : t("loginTitle")} subtitle={manager ? t("mgrLoginSub") : t("loginSub")} />
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
          </label>
          <label className="block text-sm font-medium">
            {t("fieldPassword")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              autoComplete="current-password"
              className={field}
            />
          </label>

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
            <Icon name="lock" className="h-5 w-5" />
            {busy ? t("loggingIn") : t("loginBtn")}
          </button>

          <p className="border-t border-stone-200 pt-4 text-center text-sm text-stone-600">{manager ? t("mgrNoAccountAsk") : t("noAccountAsk")}</p>
        </form>
      </main>
    </div>
  );
}
