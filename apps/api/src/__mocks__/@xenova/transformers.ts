// apps/api/src/__mocks__/@xenova/transformers.ts
export const pipeline = jest.fn().mockResolvedValue(async () => ({
  label: "mock-label",
  score: 0.99,
}));
