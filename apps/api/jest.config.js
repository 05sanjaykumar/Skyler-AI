// apps/api/jest.config.js
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      { useESM: true, tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@xenova/transformers)/)",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)?middleware/auth$": "<rootDir>/src/__mocks__/auth.ts",

  },
  setupFilesAfterEnv: ["<rootDir>/src/testUtils/setup.ts"],
   maxWorkers: 1,
};