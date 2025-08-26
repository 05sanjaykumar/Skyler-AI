// src/lib/local-nlp.ts
// src/lib/local-nlp.ts

let embedderPromise: Promise<any> | null = null;

export async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");

      // configure env before creating pipeline
      env.allowRemoteModels = true;
      env.allowLocalModels = true;
      env.cacheDir = "/models";

      console.log("✅ Initializing embedder...");
      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
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
    const bv = b[i]!;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
