"use client";

import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/adminTypes";
import { LANGS, type Lang } from "@/lib/i18n";
import { AidcLogo } from "./AidcLogo";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { SignOutButton } from "./SignOutButton";

type Props = {
  user: AdminUser;
  /** หัวข้อใหญ่ใต้แถบ (ไม่ใส่ = แถบอย่างเดียว เช่น หน้าที่ต้องใช้พื้นที่เต็มจอ) */
  title?: string;
  subtitle?: string;
  /** ชื่อหน้าในแถบ (ค่าเริ่มต้น = Ticket Support) */
  barTitle?: string;
  /** ซ่อนลิงก์หน้าหลัก (ใช้บนหน้าหลักเอง) */
  hideHome?: boolean;
  /** ใช้แทน SignOutButton เมื่อหน้านั้นจัดการเซสชันเอง (AdminApp) */
  onSignedOut?: () => void;
  /** เนื้อหาเพิ่มเติมฝั่งขวาของแถบ (เช่น ปุ่มเฉพาะหน้า) */
  extra?: React.ReactNode;
};

/**
 * ส่วนหัวมาตรฐานของทุกหน้าฝั่งทีมไอที (เค้าโครงเดียวกับหน้าหลัก /admin):
 * แถบเข้ม = โลโก้ AIDC + ชื่อ, ลิงก์ ໜ້າຫຼັກ/ສະຖິຕິ/QR, สลับภาษา, ชื่อผู้ใช้, ออกจากระบบ — ใต้แถบ = หัวข้อใหญ่ขีดส้ม + คำอธิบาย
 * หน้าที่ใช้ต้องวาง <main className="relative z-10 -mt-8 …"> เพื่อให้การ์ดขาวซ้อนขอบล่างของส่วนหัว
 */
export function AdminHeader(props: Props) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const { user, title, subtitle, barTitle, hideHome, onSignedOut, extra } = props;

  async function signOut() {
    try {
      await fetch("/api/admin/logout", { method: "POST", headers: { "content-type": "application/json" }, body: "{}", credentials: "same-origin" });
    } catch {
      // คุกกี้อาจหมดอายุไปแล้ว
    }
    onSignedOut?.();
  }

  const pill = "hidden h-9 place-items-center rounded-full bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 transition hover:bg-white/20 sm:grid";

  return (
    <header className="hero text-white">
      <div className={`mx-auto max-w-6xl px-4 pt-3 ${title ? "pb-10" : "pb-3"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AidcLogo className="h-11" />
            <div className="min-w-0 truncate text-base font-semibold">{barTitle ?? t("admTitle")}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {extra}
            {!hideHome && (
              <a href="/admin" title={t("admHome")} className="grid h-9 place-items-center rounded-full bg-white/10 px-2.5 text-xs font-bold ring-1 ring-white/20 transition hover:bg-white/20">
                <span className="flex items-center gap-1">
                  <Icon name="back" className="h-3.5 w-3.5" />
                  {t("admHome")}
                </span>
              </a>
            )}
            <a href="/admin/users" className={pill}>
              {t("admUsers")}
            </a>
            <a href="/admin/stats" className={pill}>
              {t("admStats")}
            </a>
            <a href="/" target="_blank" rel="noreferrer" className={pill}>
              QR
            </a>
            <div className="flex rounded-full bg-white/15 p-0.5 ring-1 ring-white/25" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setLang(l.id);
                    router.refresh(); // หน้าที่ render ฝั่งเซิร์ฟเวอร์ (เช่น สถิติ) ให้แสดงภาษาใหม่ทันที
                  }}
                  aria-pressed={lang === l.id}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${lang === l.id ? "bg-white text-deep-800" : "text-white/90 hover:bg-white/10"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <span className="hidden max-w-[10rem] truncate text-sm text-white/90 md:block">{user.name}</span>
            {onSignedOut ? (
              <button
                type="button"
                onClick={signOut}
                title={t("admSignOut")}
                aria-label={t("admSignOut")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            ) : (
              <SignOutButton label={t("admSignOut")} />
            )}
          </div>
        </div>
        {title && (
          <>
            <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{title}</h1>
            <span aria-hidden className="mt-2.5 block h-1 w-12 rounded-full bg-brand-500" />
            {subtitle && <p className="mt-3 max-w-3xl text-sm text-white/90">{subtitle}</p>}
          </>
        )}
      </div>
    </header>
  );
}

/** ใช้ในหน้า server component ที่ไม่มี I18nProvider (เช่น /admin/stats) */
export function AdminHeaderStandalone({ initialLang, ...props }: Props & { initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <AdminHeader {...props} />
    </I18nProvider>
  );
}
