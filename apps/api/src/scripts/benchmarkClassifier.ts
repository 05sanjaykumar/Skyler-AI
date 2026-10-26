// apps/api/src/scripts/benchmarkClassifier.ts
//
// Reproducible, realistic-scale benchmark for the EmailClassifier fix.
//
// This runs the ACTUAL production classifier (imported from
// AI_Services/gmail_AI/emailClassifier.ts, unmodified) against a faithful
// reconstruction of the PRE-FIX classifier (OldEmailClassifier, below —
// copied verbatim from git history at commit 50753ab^, kept only in this
// benchmark file, never reintroduced into production code).
//
// Both classifiers are driven through the exact same timing shape used by
// the real endpoint (apps/api/src/routes/gmail/webhooks/gmailPull.ts):
//   const t0 = Date.now();
//   const classifier = new EmailClassifier();
//   await classifier.init();
//   await classifier.filterEmails(emails, rules);
//   const classifyMs = Date.now() - t0;
//
// Run with:
//   cd apps/api
//   npx ts-node --compiler-options '{"module":"commonjs"}' src/scripts/benchmarkClassifier.ts
//
// Takes a couple of minutes on a laptop CPU (200 emails x multiple trials,
// real ONNX inference, no mocks).
//
// History: an earlier version of this script also tried batching the
// sentiment-analysis calls (one call for all emails instead of one per
// email). Isolated measurement (paper Section 6.3) showed that regressed
// latency by ~8% on this backend for realistic, variable-length email
// text (padding cost exceeds the batching saving), so it was reverted
// from emailClassifier.ts. "NEW" below reflects the reverted, shipped
// code: warm singleton + batched embedding, per-email sentiment.

import { pipeline } from "@xenova/transformers";
import { EmailClassifier } from "../AI_Services/gmail_AI/emailClassifier";
import { loadModels } from "../AI_Services/models";

// ---------------------------------------------------------------------
// OldEmailClassifier: verbatim reconstruction of the pre-fix class
// (commit 50753ab^:apps/api/src/AI_Services/gmail_AI/emailClassifier.ts),
// kept here ONLY for this benchmark's apples-to-apples comparison.
// ---------------------------------------------------------------------

interface Email {
  id: string;
  threadId: string;
  date: string;
  from: string;
  subject: string;
  snippet: string;
  aiContent?: string | null;
  body?: string | null;
}

interface AIFilterRules {
  sentiment?: "positive" | "negative" | "neutral" | null;
  keywords?: string[];
  similarityThreshold?: number;
  requiresSemanticAnalysis?: boolean;
}

type TensorLike =
  | { data: Float32Array | number[]; dims: number[]; tolist: () => any }
  | number[]
  | number[][]
  | number[][][];

function oldAs2D(t: TensorLike): number[][] {
  if (t && typeof t === "object" && "dims" in t && "tolist" in t) {
    const dims = (t as any).dims as number[];
    const arr = (t as any).tolist();
    if (dims.length === 3) return arr[0] as number[][];
    if (dims.length === 2) return arr as number[][];
    if (dims.length === 1) return [arr as number[]];
    return [Array.from((t as any).data as any)];
  }
  if (Array.isArray(t)) {
    if (Array.isArray(t[0])) {
      if (Array.isArray((t as any)[0][0])) return (t as any)[0] as number[][];
      return t as number[][];
    } else {
      return [t as number[]];
    }
  }
  throw new Error("Unexpected embedding output");
}

function oldMeanPool(tokens: number[][]): number[] {
  const seq = tokens.length;
  const hidden = tokens[0].length;
  const out = new Array(hidden).fill(0);
  for (let i = 0; i < seq; i++) {
    const row = tokens[i];
    for (let j = 0; j < hidden; j++) out[j] += row[j];
  }
  for (let j = 0; j < out.length; j++) out[j] /= Math.max(1, seq);
  return out;
}

function oldClsPool(tokens: number[][]): number[] {
  return tokens[0];
}

function oldL2(vec: number[]): number {
  let s = 0;
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
  return Math.sqrt(s);
}

function oldCosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i], bv = b[i];
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-12;
  return dot / denom;
}

class OldEmailClassifier {
  private sentimentAnalyzer: any;
  private embedder: any;

  async init() {
    // THE BUG: calls pipeline() from scratch on every `new OldEmailClassifier()`,
    // instead of reusing a warm singleton.
    this.sentimentAnalyzer = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
    this.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  private async getVector(text: string): Promise<number[]> {
    const t = (await this.embedder(text)) as TensorLike;
    let tokens = oldAs2D(t);
    let v = oldMeanPool(tokens);
    const norm = oldL2(v);
    if (!isFinite(norm) || norm < 1e-8) v = oldClsPool(tokens);
    return v;
  }

  private async analyzeSentiment(text: string) {
    const res = await this.sentimentAnalyzer(text);
    return res[0].label.toLowerCase();
  }

  private keywordMatch(email: Email, keywords: string[]): boolean {
    const text = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  }

  private async semanticAnyMatch(emailText: string, keywordVectors: number[][], threshold: number): Promise<boolean> {
    // THE OTHER BUG: one embedder call per sentence, sequentially.
    const sentences = emailText.split(/[.?!\n]/).map((s) => s.trim()).filter(Boolean);
    for (const sentence of sentences) {
      const sentenceVec = await this.getVector(sentence);
      for (let i = 0; i < keywordVectors.length; i++) {
        const sim = oldCosine(sentenceVec, keywordVectors[i]);
        if (isFinite(sim) && sim >= threshold) return true;
      }
    }
    return false;
  }

  async filterEmails(emails: Email[], rules: AIFilterRules): Promise<Email[]> {
    const keywords = rules.keywords?.filter(Boolean) ?? [];
    const threshold = typeof rules.similarityThreshold === "number" ? rules.similarityThreshold : 0.6;

    let keywordVectors: number[][] = [];
    if (rules.requiresSemanticAnalysis && keywords.length > 0) {
      keywordVectors = await Promise.all(keywords.map((kw) => this.getVector(kw)));
    }

    const tasks = emails.map(async (email) => {
      let sentimentOK = true;
      if (rules.sentiment) {
        const textToAnalyze = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
        const s = await this.analyzeSentiment(textToAnalyze);
        sentimentOK = s === rules.sentiment.toLowerCase();
      }

      const literalOK = keywords.length ? this.keywordMatch(email, keywords) : true;

      let semanticOK = false;
      if (rules.requiresSemanticAnalysis && keywordVectors.length > 0) {
        const emailText = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
        semanticOK = await this.semanticAnyMatch(emailText, keywordVectors, threshold);
      }

      const contentOK = rules.requiresSemanticAnalysis ? literalOK || semanticOK : literalOK;
      const keep = sentimentOK && contentOK;
      return keep ? email : null;
    });

    const results = await Promise.all(tasks);
    return results.filter(Boolean) as Email[];
  }
}

// ---------------------------------------------------------------------
// Synthetic, realistic-scale dataset (README claims "pull up to 200 mails
// in a single time" — so we benchmark at that scale, not a toy example).
// ---------------------------------------------------------------------

const TOPICS = [
  "please process my refund for order {n} as soon as possible",
  "can we schedule a meeting to discuss the Q{n} roadmap",
  "your invoice #{n} is attached, payment is due in 14 days",
  "the project deadline for milestone {n} has been moved up",
  "thanks for your purchase, here is your receipt number {n}",
  "reminder: your subscription renews in {n} days",
  "we noticed unusual activity on your account, please verify",
  "here is the weekly newsletter with update number {n}",
  "looking forward to catching up at the conference next week",
  "could you review the attached document before Friday",
];

function buildSyntheticEmails(count: number): Email[] {
  const emails: Email[] = [];
  for (let i = 0; i < count; i++) {
    const t1 = TOPICS[i % TOPICS.length].replace("{n}", String(i));
    const t2 = TOPICS[(i * 3 + 1) % TOPICS.length].replace("{n}", String(i + 1));
    const t3 = TOPICS[(i * 7 + 2) % TOPICS.length].replace("{n}", String(i + 2));
    emails.push({
      id: `msg-${i}`,
      threadId: `thread-${i}`,
      date: new Date().toISOString(),
      from: `sender${i}@example.com`,
      subject: `Subject line ${i}`,
      snippet: `${t1}. ${t2}. ${t3}.`,
      aiContent: null,
      body: null,
    });
  }
  return emails;
}

const FILTER_RULES: AIFilterRules = {
  sentiment: "positive",
  keywords: ["refund", "invoice", "meeting", "deadline", "project"],
  requiresSemanticAnalysis: true,
  similarityThreshold: 0.5,
};

// ---------------------------------------------------------------------
// Benchmark harness
// ---------------------------------------------------------------------

function now() {
  return Number(process.hrtime.bigint()) / 1e6; // ms
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function median(xs: number[]) {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function max(xs: number[]) {
  return Math.max(...xs);
}

async function runRequests(
  makeClassifier: () => { init: () => Promise<void>; filterEmails: (e: Email[], r: AIFilterRules) => Promise<Email[]> },
  emails: Email[],
  requestsPerTrial: number
): Promise<number[]> {
  const perRequestMs: number[] = [];
  for (let r = 0; r < requestsPerTrial; r++) {
    const t0 = now();
    const classifier = makeClassifier();
    await classifier.init();
    await classifier.filterEmails(emails, FILTER_RULES);
    perRequestMs.push(now() - t0);
  }
  return perRequestMs;
}

async function main() {
  const EMAIL_COUNT = Number(process.env.BENCH_EMAILS ?? 200);
  const REQUESTS_PER_TRIAL = Number(process.env.BENCH_REQUESTS ?? 3);
  const TRIALS = Number(process.env.BENCH_TRIALS ?? 3);

  console.log(
    `Benchmarking OLD vs NEW EmailClassifier: ${EMAIL_COUNT} emails/request, ${REQUESTS_PER_TRIAL} requests/trial, ${TRIALS} trials.\n`
  );

  const emails = buildSyntheticEmails(EMAIL_COUNT);

  // Warm the NEW code's shared singleton once, exactly as server.ts does at boot.
  await loadModels();

  const oldPerRequest: number[] = [];
  const newPerRequest: number[] = [];

  for (let trial = 0; trial < TRIALS; trial++) {
    console.log(`Trial ${trial + 1}/${TRIALS}: running OLD (buggy) classifier...`);
    const oldTimes = await runRequests(() => new OldEmailClassifier(), emails, REQUESTS_PER_TRIAL);
    oldPerRequest.push(...oldTimes);
    console.log(`  per-request ms: ${oldTimes.map((t) => t.toFixed(0)).join(", ")}`);

    console.log(`Trial ${trial + 1}/${TRIALS}: running NEW (fixed) classifier...`);
    const newTimes = await runRequests(() => new EmailClassifier(), emails, REQUESTS_PER_TRIAL);
    newPerRequest.push(...newTimes);
    console.log(`  per-request ms: ${newTimes.map((t) => t.toFixed(0)).join(", ")}\n`);
  }

  const oldMean = mean(oldPerRequest);
  const oldStd = stdev(oldPerRequest);
  const oldMedian = median(oldPerRequest);
  const oldMax = max(oldPerRequest);
  const newMean = mean(newPerRequest);
  const newStd = stdev(newPerRequest);
  const newMedian = median(newPerRequest);
  const newMax = max(newPerRequest);

  console.log("==================== RESULTS ====================");
  console.log(`Emails per request: ${EMAIL_COUNT}`);
  console.log(`Samples: OLD n=${oldPerRequest.length}, NEW n=${newPerRequest.length}`);
  console.log(`OLD classifyMs: mean=${oldMean.toFixed(1)}ms  median=${oldMedian.toFixed(1)}ms  stdev=${oldStd.toFixed(1)}ms  max=${oldMax.toFixed(1)}ms`);
  console.log(`NEW classifyMs: mean=${newMean.toFixed(1)}ms  median=${newMedian.toFixed(1)}ms  stdev=${newStd.toFixed(1)}ms  max=${newMax.toFixed(1)}ms`);
  console.log(`Speedup (mean): ${(oldMean / newMean).toFixed(2)}x   Speedup (median): ${(oldMedian / newMedian).toFixed(2)}x`);
  console.log(`Variance reduction (stdev): ${(oldStd / newStd).toFixed(2)}x more predictable`);
  console.log(`Worst case (max) reduced by: ${(oldMax - newMax).toFixed(0)}ms (${(oldMax / newMax).toFixed(2)}x)`);
  console.log("===================================================");

  console.log(
    JSON.stringify(
      {
        emailCount: EMAIL_COUNT,
        requestsPerTrial: REQUESTS_PER_TRIAL,
        trials: TRIALS,
        old: {
          samples: oldPerRequest.map((x) => Math.round(x)),
          meanMs: Math.round(oldMean),
          medianMs: Math.round(oldMedian),
          stdevMs: Math.round(oldStd),
          maxMs: Math.round(oldMax),
        },
        new: {
          samples: newPerRequest.map((x) => Math.round(x)),
          meanMs: Math.round(newMean),
          medianMs: Math.round(newMedian),
          stdevMs: Math.round(newStd),
          maxMs: Math.round(newMax),
        },
        speedupMeanX: Number((oldMean / newMean).toFixed(2)),
        speedupMedianX: Number((oldMedian / newMedian).toFixed(2)),
        variancReductionX: Number((oldStd / newStd).toFixed(2)),
        msSavedPerRequestMean: Math.round(oldMean - newMean),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
