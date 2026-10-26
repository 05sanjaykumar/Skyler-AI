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

  // Embeds a whole batch of sentences in a single model call instead of
  // awaiting the embedder once per sentence.
  private async getVectors(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const t = (await this.embedder(texts)) as TensorLike;
    const perText = asBatch3D(t);

    return perText.map((tokens) => {
      let v = meanPool(tokens);
      const norm = l2(v);
      if (!isFinite(norm) || norm < 1e-8) {
        v = clsPool(tokens);
      }
      return v;
    });
  }

  private async analyzeSentiment(text: string) {
    const res = await this.sentimentAnalyzer(text);
    return res[0].label.toLowerCase(); // 'positive'|'negative'
  }

  private keywordMatch(email: Email, keywords: string[]): boolean {
    const text = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
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


  async filterEmails(emails: Email[], rules: AIFilterRules): Promise<Email[]> {
    const keywords = rules.keywords?.filter(Boolean) ?? [];
    const threshold = typeof rules.similarityThreshold === "number" ? rules.similarityThreshold : 0.6;

    // Precompute keyword vectors once
    let keywordVectors: number[][] = [];
    if (rules.requiresSemanticAnalysis && keywords.length > 0) {
      keywordVectors = await this.getVectors(keywords);
    }

    const emailText = (email: Email) =>
      `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;

    const tasks = emails.map(async (email) => {
      // SENTIMENT (optional)
      // NOTE: deliberately NOT batched. We measured batching this specific
      // model (see apps/api/src/scripts/benchmarkClassifier.ts and the
      // paper's Section 6.3) and found batched sentiment calls on this
      // backend are consistently ~8% SLOWER than per-item calls at
      // realistic, variable-length email text — padding every short text
      // up to the batch's longest text costs more than it saves. Batching
      // was reverted here after measuring it was a regression, not kept
      // just because it worked for embeddings.
      let sentimentOK = true;
      if (rules.sentiment) {
        const s = await this.analyzeSentiment(emailText(email));
        sentimentOK = s === rules.sentiment.toLowerCase();
      }


      // CONTENT MATCH
      const literalOK = keywords.length ? this.keywordMatch(email, keywords) : true;

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

      return keep ? email : null;
    });

    const results = await Promise.all(tasks);
    return results.filter(Boolean) as Email[];
  }
}
