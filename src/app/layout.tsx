import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Noto_Sans_Lao } from "next/font/google";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";
import "./globals.css";

const lao = Noto_Sans_Lao({ variable: "--font-lao", subsets: ["lao", "latin"] });

export const metadata: Metadata = {
  title: "COSI Hotel · ລະບົບການແຈ້ງບັນຫາ",
  description: "ແຊັດຫາທີມໄອທີ COSI Hotel — IT support chat for COSI Hotel staff",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f2e30",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return (
    <html lang={isLang(saved) ? saved : DEFAULT_LANG} className={`${lao.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
