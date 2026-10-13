import type { Config } from "jest";
import base from "./base.config.ts";

/**
 * Unit test configuration.
 * Run with: npm test  (= jest --config cotester/jest/unit.config.ts)
 * เทสที่เขียนด้วยมืออยู่ใน tests/cases/ — โฟลเดอร์ tests/lib และ tests/app เป็น stub ที่เครื่องมือสร้างอัตโนมัติ
 * (ข้อมูลสุ่ม ไม่มี assertion จริง) จึงไม่รวมในชุดนี้
 */
const config: Config = {
  ...base,
  displayName: "unit",
  roots: ["<rootDir>/../tests"],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/lib/", "/tests/app/", "/tests/e2e/"],
  coverageDirectory: "<rootDir>/../coverage/unit",
  collectCoverageFrom: ["<rootDir>/../../src/lib/**/*.ts", "<rootDir>/../../src/app/api/**/route.ts"],
};

export default config;
