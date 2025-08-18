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
  complexity?: string;
  requiresSemanticAnalysis?: boolean;
}

export class EmailClassifier {
  private sentimentAnalyzer: any;

  constructor() {}

  async init() {
    // Load sentiment analysis model
    this.sentimentAnalyzer = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  }

  private async analyzeSentiment(text: string) {
    const result = await this.sentimentAnalyzer(text);
    return result[0].label.toLowerCase(); // 'positive' or 'negative'
  }

  private keywordMatch(email: Email, keywords: string[]): boolean {
    const text = `${email.subject} ${email.snippet} ${email.aiContent || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  }

  async filterEmails(emails: Email[], rules: AIFilterRules): Promise<Email[]> {
    const filtered: Email[] = [];

    for (const email of emails) {
      let matches = true;

      // 1. Keyword filter
      if (rules.keywords && rules.keywords.length > 0) {
        matches = this.keywordMatch(email, rules.keywords);
      }

      // 2. Sentiment filter
      if (matches && rules.sentiment) {
        const textToAnalyze = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
        const sentiment = await this.analyzeSentiment(textToAnalyze);
        if (sentiment !== rules.sentiment.toLowerCase()) {
          matches = false;
        }
      }

      // 3. Semantic analysis placeholder
      // If requiresSemanticAnalysis is true, you can later add embeddings & cosine similarity checks
      // For now, let's just assume keyword + sentiment is enough

      if (matches) filtered.push(email);
    }

    return filtered;
  }
}
