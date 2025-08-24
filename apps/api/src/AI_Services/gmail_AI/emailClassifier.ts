// apps/api/src/AI_Services/emailClassifier.ts

import { pipeline } from "@xenova/transformers";

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

function as2D(t: TensorLike): number[][] {
  // Handles Tensor, 3D, 2D, 1D
  if (t && typeof t === "object" && "dims" in t && "tolist" in t) {
    const dims = (t as any).dims as number[];
    const arr = (t as any).tolist();
    if (dims.length === 3) return arr[0] as number[][];
    if (dims.length === 2) return arr as number[][];
    if (dims.length === 1) return [arr as number[]];
    // Fallback: flatten
    return [Array.from((t as any).data as any)];
  }
  if (Array.isArray(t)) {
    if (Array.isArray(t[0])) {
      // 3D?
      if (Array.isArray((t as any)[0][0])) return (t as any)[0] as number[][];
      // 2D
      return t as number[][];
    } else {
      // 1D
      return [t as number[]];
    }
  }
  throw new Error("Unexpected embedding output");
}

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
    this.sentimentAnalyzer = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );

    this.embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  private async getVector(text: string): Promise<number[]> {
    const t = (await this.embedder(text)) as TensorLike;

    // Optional peek
    if (this.DEBUG && (t as any).dims) {
      console.log("embed dims:", (t as any).dims);
    }

    let tokens = as2D(t);
    let v = meanPool(tokens);

    // guard: if zero/NaN, try CLS
    const norm = l2(v);
    if (!isFinite(norm) || norm < 1e-8) {
      v = clsPool(tokens);
    }
    return v;
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
    const emailVec = await this.getVector(emailText);

    let matched = false;
    for (let i = 0; i < keywordVectors.length; i++) {
      const sim = cosine(emailVec, keywordVectors[i]);
      if (this.DEBUG) console.log("sim", i, sim.toFixed(3));
      if (isFinite(sim) && sim >= threshold) {
        matched = true;
        break;
      }
    }
    return matched;
  }

  async filterEmails(emails: Email[], rules: AIFilterRules): Promise<Email[]> {
    const keywords = rules.keywords?.filter(Boolean) ?? [];
    const threshold = typeof rules.similarityThreshold === "number" ? rules.similarityThreshold : 0.6;

    // Precompute keyword vectors once
    let keywordVectors: number[][] = [];
    if (rules.requiresSemanticAnalysis && keywords.length > 0) {
      keywordVectors = await Promise.all(keywords.map((kw) => this.getVector(kw)));
    }

    const tasks = emails.map(async (email) => {
      // SENTIMENT (optional)
      let sentimentOK = true;
      if (rules.sentiment) {
        const textToAnalyze = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
        const s = await this.analyzeSentiment(textToAnalyze);
        sentimentOK = s === rules.sentiment.toLowerCase();
      }

      console.log(`Email: ${email.subject} sentiment=${sentimentOK}`);

      // CONTENT MATCH
      const literalOK = keywords.length ? this.keywordMatch(email, keywords) : true;

      let semanticOK = false;
      if (rules.requiresSemanticAnalysis && keywordVectors.length > 0) {
        const emailText = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
        semanticOK = await this.semanticAnyMatch(emailText, keywordVectors, threshold);
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
