"use client";

import type { ReportFileDTO } from "@/lib/uploadRules";
import { useI18n } from "./I18n";
import { Icon } from "./Icon";

const fmtSize = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** แสดงไฟล์แนบของรายงาน: รูป = ภาพย่อ (คลิกเปิดเต็ม), วิดีโอ = เล่นในหน้า; `who` = identifier ของเจ้าของ (ฝั่งพนักงาน) */
export function ReportFiles({ files, who, title }: { files: ReportFileDTO[]; who?: string; title?: string }) {
  const { t } = useI18n();
  if (!files.length) return null;
  const url = (f: ReportFileDTO) => `/api/reports/files/${f.id}${who ? `?who=${encodeURIComponent(who)}` : ""}`;
  return (
    <div>
      {title && (
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="clip" className="h-4 w-4 text-deep-700" />
          {title} <span className="text-xs font-normal text-stone-500">({files.length})</span>
        </h3>
      )}
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {files.map((f) => (
          <li key={f.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            {f.kind === "image" ? (
              <a href={url(f)} target="_blank" rel="noreferrer" title={t("rcOpenFile")} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element -- ไฟล์จาก API ของเราเอง ไม่ผ่าน next/image */}
                <img src={url(f)} alt={f.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </a>
            ) : (
              <video src={url(f)} controls preload="metadata" playsInline className="aspect-[4/3] w-full bg-black object-contain" />
            )}
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] text-stone-600">
              <span className="truncate" title={f.name}>
                {f.name}
              </span>
              <span className="shrink-0 tabular-nums text-stone-400">{fmtSize(f.size)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
