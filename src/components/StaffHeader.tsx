"use client";

import Image from "next/image";
import Link from "next/link";
import { LANGS } from "@/lib/i18n";
import { CosiLogo } from "./CosiLogo";
import { useI18n } from "./I18n";
import { Icon } from "./Icon";

/**
 * ส่วนหัวของหน้าพนักงาน (หน้าหลัก / แจ้งปัญหา / สถานะ) — เค้าโครงเดียวกับหน้าแชท:
 * โลโก้ COSI + สลับภาษา + ปุ่มกลับ, หัวข้อขีดส้ม, รูปตึก COSI กรอบส้มด้านขวา และเอฟเฟกต์แสงวิ่งด้านหลัง
 */
export function StaffHeader({ title, subtitle, backHref }: { title: string; subtitle?: string; backHref?: string }) {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="hero hero-fx text-white">
      {/* แสงวิ่งด้านหลัง (ตกแต่งอย่างเดียว) */}
      <div className="fx-layer" aria-hidden="true">
        <span className="fx-orb fx-orb-a" />
        <span className="fx-orb fx-orb-b" />
        <span className="fx-sweep" />
        <span className="fx-edge" />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {backHref && (
              <Link
                href={backHref}
                aria-label={t("hubBack")}
                title={t("hubBack")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <Icon name="back" className="h-4 w-4" />
              </Link>
            )}
            <CosiLogo className="h-10" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{t("brand")}</div>
              <div className="text-xs text-white/80">IT Support</div>
            </div>
          </div>
          <div className="flex shrink-0 rounded-full bg-white/15 p-0.5 ring-1 ring-white/25" role="group" aria-label="Language">
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
        <div className="mt-5 grid items-center gap-5 md:grid-cols-[1fr_13rem] md:gap-8">
          <div>
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>
            <span aria-hidden className="mt-2.5 block h-1 w-12 rounded-full bg-brand-500" />
            {subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">{subtitle}</p>}
          </div>
          <figure className="relative mb-2 mr-2 hidden md:block">
            {/* บล็อกส้มแดงซ้อนหลัง — เลียนแบบแผงสีบนอาคาร */}
            <span aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-brand-500" />
            <Image
              src="/cosi-hotel.jpg"
              alt="COSI Hotel"
              width={442}
              height={510}
              priority
              sizes="208px"
              className="relative aspect-[5/4] w-full rounded-3xl object-cover object-[50%_40%] shadow-2xl shadow-black/30 ring-1 ring-white/25"
            />
          </figure>
        </div>
      </div>
    </header>
  );
}
