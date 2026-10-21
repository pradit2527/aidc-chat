"use client";

import { useState } from "react";
import type { AdminUser } from "@/lib/adminTypes";
import { api, ApiError } from "@/lib/adminClient";
import { LANGS, type MsgKey } from "@/lib/i18n";
import AdminConsole from "./AdminConsole";
import AdminHub from "./AdminHub";
import { AidcLogo } from "./AidcLogo";
import { I18nProvider, useI18n } from "./I18n";

type Props = {
  initialLang: "lo" | "en";
  user: AdminUser | null;
  configured: boolean;
  demo?: boolean;
  /** hub = หน้าหลักทีมไอที (เลือกแชท/แจ้งปัญหา + รายการค้าง), chat = คอนโซลตอบแชท */
  view?: "hub" | "chat";
  /** เปิดเคสนี้ทันทีเมื่อเข้าคอนโซลแชท (ลิงก์จากหน้าหลัก) */
  initialConversationId?: number | null;
  /** ระบบแชทเปิดอยู่ (CHAT_ENABLED=1) — ค่าปกติซ่อน หน้าหลักจึงมีแค่แจ้งปัญหา */
  chat?: boolean;
};

export default function AdminApp({ initialLang, user, configured, demo, view = "hub", initialConversationId = null, chat = false }: Props) {
  return (
    <I18nProvider initial={initialLang}>
      <Gate user={user} configured={configured} demo={demo} view={view} initialConversationId={initialConversationId} chat={chat} />
    </I18nProvider>
  );
}

function Gate({ user: initial, configured, demo, view, initialConversationId, chat }: Omit<Props, "initialLang">) {
  const { t } = useI18n();
  const [user, setUser] = useState<AdminUser | null>(initial);

  if (!configured) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <p role="alert" className="card max-w-md p-5 text-sm text-rose-700">
          {t("admNotConfigured")}
        </p>
      </div>
    );
  }
  if (!user) return <Login onDone={setUser} />;
  if (view === "hub" && !demo) return <AdminHub user={user} onSignedOut={() => setUser(null)} chat={chat} />;
  return <AdminConsole user={user} onSignedOut={() => setUser(null)} demo={demo} initialConversationId={initialConversationId ?? null} />;
}

function Login({ onDone }: { onDone: (u: AdminUser) => void }) {
  const { t, lang, setLang } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<MsgKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ user: AdminUser }>("/api/admin/login", { json: { email, password } });
      onDone(r.user);
    } catch (err) {
      const s = err instanceof ApiError ? err.status : 0;
      setError(
        s === 401 || s === 400 ? "admLoginFailed" : s === 403 ? "admLoginForbidden" : s === 429 ? "admLoginBusy" : "admLoginDown",
      );
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm";

  return (
    <div className="min-h-screen">
      <div className="hero h-44" />
      <div className="mx-auto -mt-28 max-w-sm px-4 pb-10">
        <div className="mb-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <AidcLogo className="h-12" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{t("admBrand")}</div>
              <div className="text-xs text-white/80">{t("admTitle")}</div>
            </div>
          </div>
          <div className="flex rounded-full bg-white/15 p-0.5 ring-1 ring-white/25" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                aria-pressed={lang === l.id}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  lang === l.id ? "bg-white text-deep-800" : "text-white/90 hover:bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <h1 className="text-lg font-bold">{t("admLoginTitle")}</h1>
            <p className="mt-0.5 text-sm text-stone-500">{t("admLoginHint")}</p>
          </div>
          <label className="block text-sm font-medium">
            {t("admEmail")}
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              className={field}
            />
          </label>
          <label className="block text-sm font-medium">
            {t("admPassword")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
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
            className="w-full rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? t("admSigningIn") : t("admSignIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
