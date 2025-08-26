// apps/api/src/AI_Services/models

// models.ts
import { pipeline } from "@xenova/transformers";

export let sentimentAnalyzer: any;
export let embedder: any;
export let summarizer: any;

export async function loadModels() {
  if (sentimentAnalyzer && embedder && summarizer) return;

  sentimentAnalyzer = await pipeline(
    "sentiment-analysis",
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
  );

  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  summarizer = await pipeline("text2text-generation", "Xenova/google/flan-t5-small");
}
