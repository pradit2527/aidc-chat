"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { LANG_COOKIE, translate, type Lang, type MsgKey } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void } | null>(null);

export function I18nProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState(initial);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    // เก็บใน cookie ให้เซิร์ฟเวอร์ render ภาษาเดิมตั้งแต่ครั้งต่อไป (ไม่กะพริบ)
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n ต้องอยู่ใน I18nProvider");
  const { lang, setLang } = ctx;
  const t = useCallback((key: MsgKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  return { lang, setLang, t };
}
