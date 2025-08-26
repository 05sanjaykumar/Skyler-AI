// src/lib/local-nlp.ts
import { pipeline } from "@xenova/transformers";

// keep one instance in memory
let embedderPromise: Promise<any> | null = null;

export async function getEmbedder() {
  if (!embedderPromise) {
    // small, fast sentence embeddings
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPromise;
}

export function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i]!;
    const bv = b[i]!; // `!` tells TS we’re sure it’s not undefined

    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

