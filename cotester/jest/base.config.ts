import type { Config } from "jest";

/**
 * Base Jest configuration shared by all test suites.
 * Import and spread into unit.config.ts or e2e.config.ts.
 * - `@/…` → src/… (ตรงกับ tsconfig paths ของแอป)
 * - utils/env.ts ตั้งค่า env ทดสอบ (ไม่แตะ .env.local และไม่ใช้ DATABASE_URL จริง)
 */
const base: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../../src/$1",
  },
  setupFiles: ["<rootDir>/../utils/env.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  verbose: true,
  clearMocks: true,
};

export default base;
