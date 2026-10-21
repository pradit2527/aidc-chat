import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", ".next-e2e/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // route ไดนามิกที่ราก (src/app/[ticket] = ลิงก์สั้นเลขตั๋ว) ทำให้กฎนี้มอง <a href="/admin…"> ทุกอันเป็น "หน้า" และฟ้องทั้งโปรเจกต์
      // ลิงก์เหล่านั้นตั้งใจโหลดหน้าเต็ม (ข้ามระหว่าง server page) จึงปิดกฎนี้
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

export default eslintConfig;
