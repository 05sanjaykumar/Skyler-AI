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
  keywords?: string[]; // all keywords + categories + intents
  similarityThreshold?: number; // for semantic matching
  requiresSemanticAnalysis?: boolean;
}

export class EmailClassifier {
  private sentimentAnalyzer: any;
  private embedder: any;
  constructor() {}

  async init() {
    // Load sentiment analysis model
    this.sentimentAnalyzer = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );

    // Load sentence-transformer for semantic similarity
    this.embedder = await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    );

  }

  private async analyzeSentiment(text: string) {
    const result = await this.sentimentAnalyzer(text);
    return result[0].label.toLowerCase(); // 'positive' | 'negative'
  }

  private keywordMatch(email: Email, keywords: string[]): boolean {
    const text = `${email.subject} ${email.snippet} ${email.aiContent || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  }

  private async semanticMatch(email: Email, keywords: string[], threshold: number) {
    const emailText = `${email.subject} ${email.snippet} ${email.aiContent || ""}`;
    const emailEmbedding = await this.embedder(emailText);

    const promises = keywords.map(async (kw) => {
      const kwEmbedding = await this.embedder(kw);
      const dot: number = emailEmbedding[0].reduce(
        (acc: number, val: number, i: number) => acc + val * (kwEmbedding[0][i] as number),
        0
      );
      const normEmail: number = Math.sqrt(emailEmbedding[0].reduce((acc: number, val: number) => acc + val * val, 0));
      const normKw: number = Math.sqrt((kwEmbedding[0] as number[]).reduce((acc: number, val: number) => acc + val * val, 0));
      const sim = dot / (normEmail * normKw);
      return sim >= threshold;
    });

    const results = await Promise.all(promises);
    return results.some((r) => r === true);
  }

  async filterEmails(emails: Email[], rules: AIFilterRules): Promise<Email[]> {
    const promises = emails.map(async (email) => {
      let matches = true;

      // 1️⃣ Keyword match
      if (rules.keywords && rules.keywords.length > 0) {
        matches = this.keywordMatch(email, rules.keywords);
      }

      // 2️⃣ Sentiment match
      if (matches && rules.sentiment) {
        const textToAnalyze = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
        const sentiment = await this.analyzeSentiment(textToAnalyze);
        if (sentiment !== rules.sentiment.toLowerCase()) matches = false;
      }

      // 3️⃣ Semantic similarity
      if (matches && rules.requiresSemanticAnalysis && rules.keywords && rules.similarityThreshold) {
        matches = await this.semanticMatch(email, rules.keywords, rules.similarityThreshold);
      }

      return matches ? email : null;
    });

    const results = await Promise.all(promises); // parallel processing for speed
    return results.filter(Boolean) as Email[];
  }
}
