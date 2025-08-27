// models.ts
// Fix "ReferenceError: self is not defined" bug when running directly with node

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

  summarizer = await pipeline("text2text-generation", "Xenova/flan-t5-small");
}
