// apps/api/src/__tests__/emailClassifier.test.ts
//
// Exercises EmailClassifier against fake sentiment/embedding models so the
// filtering logic (sentiment, literal keyword, batched semantic matching)
// can be verified without downloading real ONNX models or hitting a DB.

jest.mock("../AI_Services/models", () => {
  // Matches the real @xenova/transformers sentiment pipeline's verified
  // shape: a single string OR an array of N strings both return a flat
  // array of { label, score } results, in input order.
  const sentimentAnalyzer = jest.fn(async (input: string | string[]) => {
    const texts = Array.isArray(input) ? input : [input];
    return texts.map((text) => ({
      label: text.toLowerCase().includes("useless") ? "negative" : "positive",
      score: 0.99,
    }));
  });

  // Returns a deterministic 2D vector per input text so cosine similarity
  // against known keyword vectors is predictable.
  const vectorFor = (text: string): [number, number] => {
    const t = text.toLowerCase();
    if (t.includes("refund")) return [1, 0];
    if (t.includes("meeting")) return [0, 1];
    return [0.001, 0.001];
  };

  const embedder = jest.fn(async (input: string | string[]) => {
    const texts = Array.isArray(input) ? input : [input];
    return {
      dims: [texts.length, 1, 2],
      tolist: () => texts.map((t) => [vectorFor(t)]),
    };
  });

  return {
    loadModels: jest.fn(async () => {}),
    sentimentAnalyzer,
    embedder,
  };
});

import { EmailClassifier } from "../AI_Services/gmail_AI/emailClassifier";

const baseEmail = {
  id: "1",
  threadId: "t1",
  date: new Date().toISOString(),
  from: "someone@example.com",
};

describe("EmailClassifier", () => {
  it("keeps only emails matching the requested sentiment", async () => {
    const classifier = new EmailClassifier();
    await classifier.init();

    const emails = [
      { ...baseEmail, id: "1", subject: "Great news", snippet: "all good" },
      { ...baseEmail, id: "2", subject: "This is useless", snippet: "complaint" },
    ];

    const kept = await classifier.filterEmails(emails, { sentiment: "positive" });

    expect(kept.map((e) => e.id)).toEqual(["1"]);
  });

  it("matches via literal keywords when semantic analysis is off", async () => {
    const classifier = new EmailClassifier();
    await classifier.init();

    const emails = [
      { ...baseEmail, id: "1", subject: "Your refund", snippet: "has been processed" },
      { ...baseEmail, id: "2", subject: "Team sync", snippet: "see you there" },
    ];

    const kept = await classifier.filterEmails(emails, { keywords: ["refund"] });

    expect(kept.map((e) => e.id)).toEqual(["1"]);
  });

  it("matches semantically similar content even without the exact keyword, using batched embeddings", async () => {
    const classifier = new EmailClassifier();
    await classifier.init();

    const emails = [
      // No literal "refund" keyword, but the mocked embedder maps this
      // sentence to the same vector as the "refund" keyword.
      { ...baseEmail, id: "1", subject: "Billing", snippet: "please issue a refund for order 42" },
      { ...baseEmail, id: "2", subject: "Team sync", snippet: "see you at the meeting" },
    ];

    const kept = await classifier.filterEmails(emails, {
      keywords: ["refund"],
      requiresSemanticAnalysis: true,
      similarityThreshold: 0.9,
    });

    expect(kept.map((e) => e.id)).toEqual(["1"]);
  });

  it("embeds all sentences/keywords for a request in a single batched embedder call per email", async () => {
    const models = require("../AI_Services/models");
    const classifier = new EmailClassifier();
    await classifier.init();

    const emails = [
      { ...baseEmail, id: "1", subject: "Billing", snippet: "please issue a refund. thanks" },
    ];

    await classifier.filterEmails(emails, {
      keywords: ["refund", "meeting"],
      requiresSemanticAnalysis: true,
    });

    // 1 call to embed the keyword list + 1 call to embed this email's sentences,
    // instead of one call per keyword/sentence.
    expect(models.embedder).toHaveBeenCalledTimes(2);
  });

  it("analyzes sentiment per-email, deliberately NOT batched", async () => {
    // Batching sentiment analysis was tried and measured (see
    // apps/api/src/scripts/benchmarkClassifier.ts) to be a consistent ~8%
    // regression at realistic, variable-length email text on this backend
    // (padding every short email up to the batch's longest one costs more
    // than the batching saves) and was reverted. This test pins down the
    // reverted (per-email) call pattern so it doesn't silently get
    // re-batched later without re-measuring.
    const models = require("../AI_Services/models");
    const classifier = new EmailClassifier();
    await classifier.init();

    const emails = [
      { ...baseEmail, id: "1", subject: "Great news", snippet: "all good" },
      { ...baseEmail, id: "2", subject: "This is useless", snippet: "complaint" },
      { ...baseEmail, id: "3", subject: "Another one", snippet: "fine" },
    ];

    const kept = await classifier.filterEmails(emails, { sentiment: "positive" });

    expect(kept.map((e) => e.id)).toEqual(["1", "3"]);
    expect(models.sentimentAnalyzer).toHaveBeenCalledTimes(3);
  });
});
