import Image from "next/image";

/** โลโก้ AIDC TECH (รูปมีพื้นหลังสีน้ำเงินเข้มในตัว จึงใส่กรอบมนบางๆ ให้เข้ากับแถบหัวสีเข้ม) */
export function AidcLogo({ className = "h-11" }: { className?: string }) {
  return (
    <Image
      src="/aidc-tech-logo.jpg"
      alt="AIDC TECH"
      width={516}
      height={317}
      priority
      className={`w-auto shrink-0 rounded-lg ring-1 ring-white/25 ${className}`}
    />
  );
}
