"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18n";
import { Icon } from "./Icon";

export type TopicItem = { title: string; name: string; color: string };

type Props = {
  customer: string;
  /** หัวข้อที่ยังไม่ปิด */
  topics: TopicItem[];
  /** หัวข้อที่ปิดไปแล้วก่อนหน้านี้ (แสดงเป็นข้อมูลประกอบ) */
  closed: TopicItem[];
  busy: boolean;
  error: boolean;
  onCancel: () => void;
  onConfirm: (selected: string[]) => void;
};

/** หน้าต่างยืนยันปิดเคส: ติ๊กหัวข้อที่แก้เสร็จแล้ว — ติ๊กครบ = ปิดเคสทั้งหมด, ติ๊กบางส่วน = ปิดเฉพาะหัวข้อนั้น */
export default function CloseCaseDialog({ customer, topics, closed, busy, error, onCancel, onConfirm }: Props) {
  const { t } = useI18n();
  // เริ่มต้นติ๊กทุกหัวข้อไว้ (กรณีทั่วไปคือแก้เสร็จทั้งหมด) แล้วให้เอาติ๊กออกได้
  const [picked, setPicked] = useState<Set<string>>(() => new Set(topics.map((x) => x.title)));
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const noTopics = topics.length === 0;
  const allPicked = topics.length > 0 && picked.size === topics.length;
  const closesWholeCase = noTopics || allPicked;
  const canConfirm = !busy && (noTopics || picked.size > 0);

  function toggle(title: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  const box = "h-4 w-4 shrink-0 cursor-pointer rounded border-stone-300 accent-brand-600";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={t("cancel")}
        tabIndex={-1}
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 cursor-default bg-stone-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-case-title"
        className="relative flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-stone-100 px-5 pb-3 pt-4">
          <h2 id="close-case-title" className="text-lg font-bold">
            {t("admCloseTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">{t("admCloseHint", { name: customer })}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {noTopics ? (
            <p className="rounded-lg bg-stone-50 px-3 py-3 text-sm text-stone-600">{t("admCloseNoTopics")}</p>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t("admOpenTopics")}</h3>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-600">
                  <input
                    type="checkbox"
                    className={box}
                    checked={allPicked}
                    onChange={() => setPicked(allPicked ? new Set() : new Set(topics.map((x) => x.title)))}
                  />
                  {t("admSelectAll")}
                </label>
              </div>
              <ul className="space-y-2">
                {topics.map((x) => {
                  const on = picked.has(x.title);
                  return (
                    <li key={x.title}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                          on ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white hover:border-stone-300"
                        }`}
                      >
                        <input type="checkbox" className={box} checked={on} onChange={() => toggle(x.title)} />
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: x.color }} />
                        <span className="min-w-0 flex-1 text-sm font-medium">{x.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {!closesWholeCase && picked.size > 0 && (
                <p className="mt-3 text-xs text-stone-500">{t("admCloseStaysOpen")}</p>
              )}
            </>
          )}

          {closed.length > 0 && (
            <div className="mt-4 border-t border-stone-100 pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t("admClosedTopics")}</h3>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {closed.map((x) => (
                  <li
                    key={x.title}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700"
                  >
                    <Icon name="check" className="h-3 w-3" />
                    {x.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm text-rose-600">
              {t("admCloseErr")}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-stone-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60 sm:flex-none sm:px-5"
          >
            {t("cancel")}
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm([...picked])}
            className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Icon name="check" className="h-4 w-4" />
            {busy
              ? t("admClosing")
              : closesWholeCase
                ? t("admCloseAll")
                : t("admCloseSelected", { n: picked.size })}
          </button>
        </div>
      </div>
    </div>
  );
}
