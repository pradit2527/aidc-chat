import Image from "next/image";

/**
 * โลโก้ COSI — ป้ายสีแดงบนตึกจริง (ตัดจากรูปอาคาร หมุนให้อ่านแนวนอน)
 * รูปเป็นสัดส่วน 240×116 → ใส่ความสูงผ่าน className (เช่น h-10) ความกว้างปรับตาม
 */
export function CosiLogo({ className = "h-10" }: { className?: string }) {
  return (
    <Image
      src="/cosi-logo.jpg"
      alt="COSI"
      width={240}
      height={116}
      priority
      className={`w-auto shrink-0 rounded-lg shadow-md shadow-black/30 ring-1 ring-white/35 ${className}`}
    />
  );
}
