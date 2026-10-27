// apps/api/src/AI_Services/emailClassifier.ts

import * as Models from "../models";
import { loadModels } from "../models";

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
  similarityThreshold?: number; // 0..1
  requiresSemanticAnalysis?: boolean;
}

export interface FilterDecisionReason {
  sentiment: string | null; // the detected sentiment label, if rules.sentiment was set
  sentimentOK: boolean;
  matchedKeyword: string | null; // literal keyword match, if any
  semanticMatch: boolean;
  kept: boolean;
}

export interface FilterDecision {
  email: Email;
  kept: boolean;
  reason: FilterDecisionReason;
}

type TensorLike =
  | { data: Float32Array | number[]; dims: number[]; tolist: () => any }
  | number[]
  | number[][]
  | number[][][];

// --- Utils -------------------------------------------------------

function meanPool(tokens: number[][]): number[] {
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

function clsPool(tokens: number[][]): number[] {
  return tokens[0];
}

// Splits a batched feature-extraction output (dims [batch, seq, hidden]) into
// one token-matrix per input text, so a whole batch can be embedded in a
// single model call instead of one call per sentence.
function asBatch3D(t: TensorLike): number[][][] {
  if (t && typeof t === "object" && "dims" in t && "tolist" in t) {
    const dims = (t as any).dims as number[];
    const arr = (t as any).tolist();
    if (dims.length === 3) return arr as number[][][];
    if (dims.length === 2) return [arr as number[][]];
    if (dims.length === 1) return [[arr as number[]]];
  }
  if (Array.isArray(t)) {
    if (Array.isArray(t[0]) && Array.isArray((t as any)[0][0])) {
      return t as unknown as number[][][];
    }
    if (Array.isArray(t[0])) {
      return (t as number[][]).map((row) => [row]);
    }
  }
  throw new Error("Unexpected batched embedding output");
}

function l2(vec: number[]): number {
  let s = 0;
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
  return Math.sqrt(s);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i],
      bv = b[i];
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-12;
  return dot / denom;
}

const DEFAULT_BUCKET_SIZE = 16;

// Calls a batched model function (the embedder or the sentiment analyzer)
// in groups of texts sorted by length, instead of one call for the whole
// input. A single naive batch call pads every text up to the batch's
// longest member, which (measured in apps/api/src/scripts/benchmarkClassifier.ts
// and a follow-up bucketed-batch experiment) erased the benefit of batching
// for embeddings and made sentiment analysis ~8% SLOWER than calling it once
// per item, on realistic variable-length email text. Sorting by length and
// batching within small, length-similar buckets keeps each bucket's padding
// waste small while still getting most of batching's per-call overhead
// savings: measured as a consistent, repeatable win (no overlapping trials)
// over both "one call per item" and "one call for everything," for both the
// embedder (~1.2x) and the sentiment pipeline (~1.1-1.14x).
async function callInLengthBuckets<R>(
  texts: string[],
  callBatch: (batch: string[]) => Promise<R[]>,
  bucketSize: number = DEFAULT_BUCKET_SIZE
): Promise<R[]> {
  if (texts.length === 0) return [];

  const order = texts.map((_, i) => i).sort((a, b) => texts[a].length - texts[b].length);
  const results = new Array<R>(texts.length);

  for (let i = 0; i < order.length; i += bucketSize) {
    const bucketIndices = order.slice(i, i + bucketSize);
    const bucketTexts = bucketIndices.map((idx) => texts[idx]);
    const bucketResults = await callBatch(bucketTexts);
    bucketIndices.forEach((origIdx, j) => {
      results[origIdx] = bucketResults[j];
    });
  }

  return results;
}

// --- Classifier --------------------------------------------------

export class EmailClassifier {
  private sentimentAnalyzer: any;
  private embedder: any;
  private DEBUG = false; // flip to true for console traces

  async init() {
    // Models are loaded once per process (see AI_Services/models.ts) and
    // reused across requests instead of re-initializing the ONNX pipelines
    // on every classifier instance, which was the main source of latency.
    await loadModels();
    this.sentimentAnalyzer = Models.sentimentAnalyzer;
    this.embedder = Models.embedder;
  }

  // Embeds a whole batch of texts via length-bucketed calls (see
  // callInLengthBuckets) instead of one call per text.
  private async getVectors(texts: string[]): Promise<number[][]> {
    return callInLengthBuckets(texts, async (batch) => {
      const t = (await this.embedder(batch)) as TensorLike;
      const perText = asBatch3D(t);

      return perText.map((tokens) => {
        let v = meanPool(tokens);
        const norm = l2(v);
        if (!isFinite(norm) || norm < 1e-8) {
          v = clsPool(tokens);
        }
        return v;
      });
    });
  }

  // Analyzes a whole batch of emails' text via length-bucketed calls
  // instead of one sentiment-analyzer call per email.
  private async analyzeSentiments(texts: string[]): Promise<string[]> {
    return callInLengthBuckets(texts, async (batch) => {
      const res = (await this.sentimentAnalyzer(batch)) as { label: string; score: number }[];
      return res.map((r) => r.label.toLowerCase());
    });
  }

  private keywordMatch(email: Email, keywords: string[]): boolean {
    return this.findMatchedKeyword(email, keywords) !== null;
  }

  private findMatchedKeyword(email: Email, keywords: string[]): string | null {
    const text = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`.toLowerCase();
    return keywords.find((kw) => text.includes(kw.toLowerCase())) ?? null;
  }

  private async semanticAnyMatch(
    emailText: string,
    keywordVectors: number[][],
    threshold: number
  ): Promise<boolean> {
    // Split text into sentences
    const sentences = emailText.split(/[.?!\n]/).map(s => s.trim()).filter(Boolean);
    if (sentences.length === 0) return false;

    const sentenceVectors = await this.getVectors(sentences);

    for (const sentenceVec of sentenceVectors) {
      for (let i = 0; i < keywordVectors.length; i++) {
        const sim = cosine(sentenceVec, keywordVectors[i]);
        if (isFinite(sim) && sim >= threshold) {
          return true; // match found
        }
      }
    }
    return false;
  }


  // Evaluates every email against the rule and returns a decision PLUS the
  // reason behind it (sentiment label, which keyword matched, whether the
  // semantic path fired). filterEmails() below is the original, unchanged
  // public contract (kept/discarded emails only, nothing else) — this is
  // the richer version used for explainability and for measuring filtering
  // accuracy against a labeled test set (apps/api/src/scripts/evalFilteringAccuracy.ts).
  private async evaluate(emails: Email[], rules: AIFilterRules): Promise<FilterDecision[]> {
    const keywords = rules.keywords?.filter(Boolean) ?? [];
    // Default similarity threshold, measured, not guessed: a labeled
    // filtering-accuracy benchmark (apps/api/src/scripts/evalFilteringAccuracy.ts)
    // found the previous default of 0.6 (and 0.5) gave 100% precision but
    // only 43.3% recall (F1 60.5%) — single-word keyword vs. full-sentence
    // embeddings score lower on cosine similarity than sentence-vs-sentence
    // comparisons, even for genuinely on-topic paraphrases, so the semantic
    // path almost never fired and the "semantic OR keyword" rule silently
    // degraded to keyword-only matching. A threshold sweep (0.6 down to
    // 0.25) found 0.35 as the best point: 94.4% accuracy, 100% precision,
    // 83.3% recall, F1 90.9% on the same test set — a +30.4 F1 point fix,
    // not a tuning nicety.
    const DEFAULT_SIMILARITY_THRESHOLD = 0.35;
    const threshold = typeof rules.similarityThreshold === "number" ? rules.similarityThreshold : DEFAULT_SIMILARITY_THRESHOLD;

    // Precompute keyword vectors once
    let keywordVectors: number[][] = [];
    if (rules.requiresSemanticAnalysis && keywords.length > 0) {
      keywordVectors = await this.getVectors(keywords);
    }

    const emailText = (email: Email) =>
      `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;

    // Precompute sentiment for every email via length-bucketed batching
    // (see callInLengthBuckets). An earlier attempt at NAIVE batching (one
    // call for every email, regardless of length) was measured to be a
    // consistent ~8% regression and was reverted; length-bucketing was
    // tried as the follow-up and measured to reliably beat both that and
    // the original per-email calls.
    let sentimentLabels: string[] = [];
    if (rules.sentiment) {
      sentimentLabels = await this.analyzeSentiments(emails.map(emailText));
    }

    const tasks = emails.map(async (email, index): Promise<FilterDecision> => {
      // SENTIMENT (optional)
      let sentimentOK = true;
      let sentimentLabel: string | null = null;
      if (rules.sentiment) {
        sentimentLabel = sentimentLabels[index];
        sentimentOK = sentimentLabel === rules.sentiment.toLowerCase();
      }

      // CONTENT MATCH
      const matchedKeyword = keywords.length ? this.findMatchedKeyword(email, keywords) : null;
      const literalOK = keywords.length ? matchedKeyword !== null : true;

      let semanticOK = false;
      if (rules.requiresSemanticAnalysis && keywordVectors.length > 0) {
        semanticOK = await this.semanticAnyMatch(emailText(email), keywordVectors, threshold);
      }

      // If semantic is enabled, use OR between literal and semantic.
      // If not enabled, rely on literal (or true if no keywords).
      const contentOK = rules.requiresSemanticAnalysis
        ? (literalOK || semanticOK)
        : literalOK;

      const keep = sentimentOK && contentOK;

      if (this.DEBUG) {
        console.log(
          `[${email.subject}] sentimentOK=${sentimentOK} literalOK=${literalOK} semanticOK=${semanticOK} => keep=${keep}`
        );
      }

      return {
        email,
        kept: keep,
        reason: {
          sentiment: sentimentLabel,
          sentimentOK,
          matchedKeyword,
          semanticMatch: semanticOK,
          kept: keep,
        },
      };
    });

    return Promise.all(tasks);
  }

  async filterEmails(emails: Email[], rules: AIFilterRules): Promise<Email[]> {
    const decisions = await this.evaluate(emails, rules);
    return decisions.filter((d) => d.kept).map((d) => d.email);
  }

  // Same filtering decision as filterEmails(), but returns the reason for
  // every email (kept or not) instead of just the kept ones. Not wired into
  // the live /gmail/pull endpoint yet (see paper's Outcomes/Future Work) —
  // available for explainability UIs and for measuring filtering accuracy
  // against a labeled test set without changing the existing API contract.
  async filterEmailsWithReasons(emails: Email[], rules: AIFilterRules): Promise<FilterDecision[]> {
    return this.evaluate(emails, rules);
  }
}
