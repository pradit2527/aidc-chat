"use client";

import QRCode from "qrcode";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LANGS } from "@/lib/i18n";
import { CosiLogo } from "./CosiLogo";
import { I18nProvider, useI18n } from "./I18n";

type Props = { initialLang: "lo" | "en"; publicUrl: string; showTools?: boolean };

const DARK = "#0f2e30"; // เขียวอมน้ำเงินเข้มของแบรนด์ — คอนทราสต์สูงบนพื้นขาว สแกนง่าย

export default function QrPoster({ initialLang, publicUrl, showTools = false }: Props) {
  return (
    <I18nProvider initial={initialLang}>
      <Poster publicUrl={publicUrl} showTools={showTools} />
    </I18nProvider>
  );
}

/** path ของหน้าพนักงาน — QR ต้องพาไปหน้านี้เท่านั้น (ตัด path/query อื่นทิ้ง ไม่ให้หลุดไป /admin) */
/** ปลายทางของ QR = หน้าล็อกอิน (ล็อกอินสำเร็จแล้วไปหน้าหลัก /start; ล็อกอินค้างอยู่แล้วข้ามไป /start เอง) */
export const STAFF_PATH = "/login";

function staffUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `${u.origin}${STAFF_PATH}`;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

function Poster({ publicUrl, showTools }: { publicUrl: string; showTools: boolean }) {
  const { t, lang, setLang } = useI18n();
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
  const [custom, setCustom] = useState<string | null>(null);
  const [svg, setSvg] = useState("");
  const [copied, setCopied] = useState(false);

  const input = custom ?? (publicUrl || origin);
  const target = input ? staffUrl(input) : null;
  const isLocal = target ? /^https?:\/\/(localhost|127\.|\[::1\])/i.test(target) : false;

  useEffect(() => {
    if (!target) return;
    let live = true;
    QRCode.toString(target, {
      type: "svg",
      errorCorrectionLevel: "Q",
      margin: 0,
      color: { dark: DARK, light: "#ffffff" },
    })
      .then((s) => live && setSvg(s))
      .catch(() => live && setSvg(""));
    return () => {
      live = false;
    };
  }, [target]);

  function save(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  }

  async function downloadPng() {
    if (!target) return;
    const data = await QRCode.toDataURL(target, {
      width: 1200,
      margin: 3,
      errorCorrectionLevel: "Q",
      color: { dark: DARK, light: "#ffffff" },
    });
    save(data, "cosi-support-qr.png");
  }

  function downloadSvg() {
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    save(url, "cosi-support-qr.svg");
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copy() {
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard ถูกบล็อก — ผู้ใช้คัดลอกจากช่องข้อความได้
    }
  }

  const btn =
    "inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50";

  return (
    <div className="min-h-screen bg-canvas print:bg-white">
      {/* แถบควบคุม — ไม่ออกเวลาพิมพ์ */}
      {showTools && (
      <header className="hero text-white print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <CosiLogo className="h-10" />
            <h1 className="text-base font-semibold">{t("qrTitle")}</h1>
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
      </header>
      )}

      <main
        className={
          showTools
            ? "mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[1fr_auto] md:items-start print:block print:max-w-none print:p-0"
            : "mx-auto max-w-md px-4 py-8 print:max-w-none print:p-0"
        }
      >
        {/* ตัวควบคุม (แสดงเฉพาะ ?tools=1) */}
        {showTools && (
        <section className="card order-2 space-y-4 p-5 md:order-1 print:hidden">
          <p className="text-sm text-stone-600">{t("qrHint")}</p>
          <label className="block text-sm font-medium">
            {t("qrUrlLabel")}
            <input
              value={input}
              onChange={(e) => setCustom(e.target.value)}
              inputMode="url"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-mono text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
            />
          </label>
          {!target && input && (
            <p role="alert" className="text-sm text-rose-600">
              {t("qrInvalid")}
            </p>
          )}
          {isLocal && (
            <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
              {t("qrLocalWarn")}
            </p>
          )}
          <p className="text-xs text-stone-500">{t("qrOnlyStaff")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!target}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {t("qrPrint")}
            </button>
            <button type="button" onClick={() => void downloadPng()} disabled={!target} className={btn}>
              {t("qrPng")}
            </button>
            <button type="button" onClick={downloadSvg} disabled={!svg} className={btn}>
              {t("qrSvg")}
            </button>
            <button type="button" onClick={() => void copy()} disabled={!target} className={btn}>
              {copied ? t("qrCopied") : t("qrCopy")}
            </button>
          </div>
        </section>
        )}

        {/* โปสเตอร์ */}
        <section className="poster order-1 mx-auto w-full max-w-[26rem] overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-stone-200 md:order-2 print:max-w-[18cm] print:rounded-none print:shadow-none print:ring-0">
          <div className="relative h-44 overflow-hidden bg-deep-800">
            <Image
              src="/cosi-hotel.jpg"
              alt="COSI Hotel"
              fill
              priority
              sizes="26rem"
              className="object-cover object-[50%_42%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-900 via-deep-900/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/85">
                <CosiLogo className="h-7" />
                COSI HOTEL
              </div>
              <h2 className="mt-1.5 text-2xl font-bold leading-tight">ລະບົບການແຈ້ງບັນຫາ</h2>
              <p className="text-sm text-white/90">Ticket System</p>
            </div>
          </div>
          <div className="h-1 bg-brand-500" />

          <div className="px-6 pb-6 pt-5 text-center">
            <p className="text-sm font-semibold text-stone-800">ສະແກນດ້ວຍກ້ອງມືຖື ແລ້ວແຈ້ງບັນຫາຫາທີມໄອທີໄດ້ທັນທີ</p>
            <p className="text-xs text-stone-500">Scan with your phone camera and report a problem to the IT team</p>

            <div className="relative mx-auto mt-4 w-fit">
              {/* มุมสีส้มแดงเหมือนแผงสีบนอาคาร */}
              <span aria-hidden className="absolute -left-2 -top-2 h-7 w-7 rounded-tl-xl border-l-[5px] border-t-[5px] border-brand-500" />
              <span aria-hidden className="absolute -right-2 -top-2 h-7 w-7 rounded-tr-xl border-r-[5px] border-t-[5px] border-brand-500" />
              <span aria-hidden className="absolute -bottom-2 -left-2 h-7 w-7 rounded-bl-xl border-b-[5px] border-l-[5px] border-brand-500" />
              <span aria-hidden className="absolute -bottom-2 -right-2 h-7 w-7 rounded-br-xl border-b-[5px] border-r-[5px] border-brand-500" />
              <div className="grid h-60 w-60 place-items-center rounded-lg bg-white p-3 sm:h-64 sm:w-64">
                {target && svg ? (
                  <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
                ) : (
                  <div className="h-full w-full animate-pulse rounded-md bg-stone-100" />
                )}
              </div>
            </div>

            <ol className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] leading-snug text-stone-600">
              {[
                ["1", "ສະແກນ QR", "Scan"],
                ["2", "ກອກຊື່ ແລະ ເລືອກບັນຫາ", "Pick your problem"],
                ["3", "ສົ່ງຫາທີມໄອທີ ແລ້ວຕິດຕາມສະຖານະ", "Send to IT & track status"],
              ].map(([n, lo, en]) => (
                <li key={n} className="flex flex-col items-center gap-1">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-deep-700 text-xs font-bold text-white">{n}</span>
                  <span className="font-semibold text-stone-800">{lo}</span>
                  <span>{en}</span>
                </li>
              ))}
            </ol>

            <p className="mt-5 break-all font-mono text-[11px] text-stone-400">{target ?? ""}</p>
          </div>
        </section>
      </main>

      {/* ทางไปหน้าอื่นโดยไม่ต้องสแกน (ไม่พิมพ์ออกกระดาษ) */}
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4 pb-8 text-sm print:hidden">
        <a
          href={STAFF_PATH}
          className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 font-semibold text-white transition hover:bg-brand-700"
        >
          {t("qrGoStaff")}
        </a>
        <a
          href="/manager"
          className="inline-flex h-10 items-center rounded-lg border border-deep-700 px-4 font-semibold text-deep-700 transition hover:bg-deep-50"
        >
          {t("qrGoManager")}
        </a>
        <a href="/admin" className="inline-flex h-10 items-center px-3 text-stone-500 hover:text-deep-700 hover:underline">
          {t("qrGoAdmin")}
        </a>
      </nav>
    </div>
  );
}
