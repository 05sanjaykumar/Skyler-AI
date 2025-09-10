"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeline = void 0;
// apps/api/src/__mocks__/@xenova/transformers.ts
exports.pipeline = jest.fn().mockResolvedValue(async () => [{ label: "mock-label", score: 0.99 }]);
