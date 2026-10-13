import type { Config } from "jest";
import base from "./base.config.ts";

/**
 * End-to-end / integration test configuration.
 * Run with: jest --config cotester/jest/e2e.config.ts
 */
const config: Config = {
  ...base,
  displayName: "e2e",
  roots: ["<rootDir>/../tests/e2e"],
  testMatch: ["**/*.e2e.ts", "**/*.e2e-spec.ts"],
  testTimeout: 30_000,
  coverageDirectory: "<rootDir>/../coverage/e2e",
};

export default config;
