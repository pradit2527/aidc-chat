"use client";

import { useCallback, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/adminClient";
import type { AdminUser } from "@/lib/adminTypes";
import { DEPARTMENTS } from "@/lib/categories";
import type { Lang, MsgKey } from "@/lib/i18n";
import { useLive } from "@/lib/useLive";
import type { UserListItem } from "@/lib/users";
import { AdminHeader } from "./AdminHeader";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";

/** แอดมินสร้าง/แก้ไข/รีเซ็ตรหัสผ่าน/ลบ บัญชีพนักงาน (แทนการลงทะเบียนเองหน้า QR) */
export default function UsersConsole({ user, initialLang }: { user: AdminUser; initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <Console user={user} />
    </I18nProvider>
  );
}

const ERRORS: Record<string, MsgKey> = {
  username_invalid: "errUsernameInvalid",
  password_invalid: "errPasswordInvalid",
  username_taken: "errUsernameTaken",
  name_required: "errNameRequired",
  department_required: "errDeptRequired",
  storage_error: "uNoDb",
  cannot_delete_self: "uCannotDeleteSelf",
};

const field =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm";

async function call<T>(path: string, method: string, json?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: json !== undefined ? { "content-type": "application/json" } : undefined,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw Object.assign(new ApiError(res.status), { code: data.error ?? "" });
  return data;
}
const errKey = (e: unknown): MsgKey => ERRORS[(e as { code?: string }).code ?? ""] ?? "errServer";

function Console({ user }: { user: AdminUser }) {
  const { t, lang } = useI18n();
  const [users, setUsers] = useState<UserListItem[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"staff" | "admin">("staff");
  const [editing, setEditing] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers((await api<{ users: UserListItem[] }>("/api/admin/users")).users);
      setLoadErr(false);
    } catch {
      setLoadErr(true);
    }
  }, []);
  // ไม่รีเฟรชอัตโนมัติขณะกำลังแก้ไข กันฟอร์มที่พิมพ์ค้างถูกรีเซ็ต
  useLive(() => (editing === null ? load() : undefined), 15_000);

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (users ?? []).filter((u) => u.role === tab && (!k || u.username.includes(k) || u.name.toLowerCase().includes(k)));
  }, [users, q, tab]);
  const dept = (id: string) => DEPARTMENTS.find((d) => d.id === id)?.label[lang] ?? id;

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} title={t("uTitle")} subtitle={t("uSub")} barTitle={t("admUsers")} />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-6xl gap-4 px-4 pb-10 lg:grid-cols-[22rem_1fr]">
        <CreateForm
          onCreated={(name) => {
            setNotice(t("uCreated", { name }));
            load();
          }}
        />

        <section className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Icon name="list" className="h-4 w-4 text-deep-700" />
              {t("uList")}
              {users && <span className="text-xs font-normal text-stone-500">({users.filter((u) => u.role === tab).length})</span>}
            </h2>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("uSearch")}
              aria-label={t("uSearch")}
              className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 sm:w-60"
            />
          </div>
          <div className="mt-3 flex gap-1 rounded-lg bg-stone-100 p-1 text-sm font-semibold" role="tablist">
            {(["staff", "admin"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`flex-1 rounded-md px-3 py-1.5 transition ${tab === k ? "bg-white text-deep-800 shadow-sm" : "text-stone-600 hover:text-deep-800"}`}
              >
                {k === "staff" ? t("uTabStaff") : t("uTabAdmin")}
              </button>
            ))}
          </div>
          {notice && (
            <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </p>
          )}
          {loadErr && (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              {t("uNoDb")}
            </p>
          )}
          {users && shown.length === 0 && !loadErr && <p className="mt-4 text-sm text-stone-500">{t("uEmpty")}</p>}
          <ul className="mt-3 divide-y divide-stone-100">
            {shown.map((u) => (
              <li key={u.id} className="py-3">
                {editing === u.id ? (
                  <EditRow
                    u={u}
                    onDone={(msg) => {
                      setEditing(null);
                      if (msg) setNotice(msg);
                      load();
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {u.name} <span className="font-normal text-stone-500">· {u.username}</span>
                      </div>
                      <div className="truncate text-xs text-stone-500">
                        {[u.role === "admin" ? t("uBadgeAdmin") : dept(u.department), u.contact].filter(Boolean).join(" · ")}
                        {u.createdAt ? ` · ${t("uCreatedAt")} ${new Date(u.createdAt * 1000).toLocaleDateString("en-GB")}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setEditing(u.id);
                      }}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-deep-700 hover:bg-deep-100"
                    >
                      {t("uEdit")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function DeptSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t, lang } = useI18n();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
      <option value="">{t("deptPlaceholder")}</option>
      {DEPARTMENTS.map((d) => (
        <option key={d.id} value={d.id}>
          {d.label[lang]}
        </option>
      ))}
    </select>
  );
}

function CreateForm({ onCreated }: { onCreated: (name: string) => void }) {
  const { t } = useI18n();
  const empty = { role: "staff", username: "", password: "", name: "", department: "", contact: "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<MsgKey | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof empty) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await call("/api/admin/users", "POST", f);
      onCreated(f.name.trim());
      setF(empty);
    } catch (e2) {
      setErr(errKey(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card h-fit space-y-3 p-4 sm:p-5" noValidate>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon name="plus" className="h-4 w-4 text-deep-700" />
        {t("uNew")}
      </h2>
      <label className="block text-sm font-medium">
        {t("uRole")}
        <select value={f.role} onChange={(e) => set("role")(e.target.value)} className={field}>
          <option value="staff">{t("uRoleStaff")}</option>
          <option value="admin">{t("uRoleAdmin")}</option>
        </select>
        {f.role === "admin" && <span className="mt-1 block text-xs font-normal text-stone-500">{t("uAdminHint")}</span>}
      </label>
      <label className="block text-sm font-medium">
        {t("fieldUsername")}
        <input value={f.username} onChange={(e) => set("username")(e.target.value)} maxLength={40} autoComplete="off" autoCapitalize="none" spellCheck={false} className={field} />
        <span className="mt-1 block text-xs font-normal text-stone-500">{t("uUsernameHint")}</span>
      </label>
      <label className="block text-sm font-medium">
        {t("fieldPassword")}
        <input type="text" value={f.password} onChange={(e) => set("password")(e.target.value)} maxLength={100} autoComplete="off" className={field} />
        <span className="mt-1 block text-xs font-normal text-stone-500">{t("uPasswordHint")}</span>
      </label>
      <label className="block text-sm font-medium">
        {t("fieldName")}
        <input value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={80} className={field} />
      </label>
      {f.role === "staff" && (
        <>
          <label className="block text-sm font-medium">
            {t("fieldDept")}
            <DeptSelect value={f.department} onChange={set("department")} />
          </label>
          <label className="block text-sm font-medium">
            {t("fieldContact")}
            <input value={f.contact} onChange={(e) => set("contact")(e.target.value)} maxLength={40} inputMode="tel" className={field} />
          </label>
        </>
      )}
      {err && (
        <p role="alert" className="text-sm text-rose-600">
          {t(err)}
        </p>
      )}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-deep-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-deep-800 disabled:opacity-60">
        {busy ? t("uCreating") : t("uCreate")}
      </button>
    </form>
  );
}

function EditRow({ u, onDone }: { u: UserListItem; onDone: (msg?: string) => void }) {
  const { t } = useI18n();
  const [f, setF] = useState({ name: u.name, department: u.department, contact: u.contact, password: "" });
  const [err, setErr] = useState<MsgKey | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await call(`/api/admin/users/${u.id}`, "PATCH", f);
      onDone(t("uSaved"));
    } catch (e2) {
      setErr(errKey(e2));
      setBusy(false);
    }
  }
  async function remove() {
    if (busy || !window.confirm(t("uDeleteConfirm", { name: `${u.name} (${u.username})` }))) return;
    setBusy(true);
    try {
      await call(`/api/admin/users/${u.id}`, "DELETE");
      onDone();
    } catch (e2) {
      setErr(errKey(e2));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200" noValidate>
      <div className="text-sm font-semibold">{u.username}</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-medium">
          {t("fieldName")}
          <input value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={80} className={field} />
        </label>
        {u.role === "staff" && (
          <>
            <label className="block text-xs font-medium">
              {t("fieldDept")}
              <DeptSelect value={f.department} onChange={set("department")} />
            </label>
            <label className="block text-xs font-medium">
              {t("fieldContact")}
              <input value={f.contact} onChange={(e) => set("contact")(e.target.value)} maxLength={40} className={field} />
            </label>
          </>
        )}
      </div>
      <label className="block text-xs font-medium">
        {t("uNewPassword")}
        <input type="text" value={f.password} onChange={(e) => set("password")(e.target.value)} maxLength={100} autoComplete="off" className={field} />
      </label>
      {err && (
        <p role="alert" className="text-sm text-rose-600">
          {t(err)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className="rounded-lg bg-deep-700 px-4 py-2 text-sm font-semibold text-white hover:bg-deep-800 disabled:opacity-60">
          {t("uSave")}
        </button>
        <button type="button" onClick={() => onDone()} className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-200">
          {t("cancel")}
        </button>
        <button type="button" onClick={remove} disabled={busy} className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
          <Icon name="trash" className="h-4 w-4" />
          {t("uDelete")}
        </button>
      </div>
    </form>
  );
}
