// apps/api/src/scripts/evalSentimentModel.ts
//
// Measures Skyler AI's ACTUAL, deployed sentiment model
// (Xenova/distilbert-base-uncased-finetuned-sst-2-english, the exact model
// loaded by apps/api/src/AI_Services/models.ts) against the real, standard
// SST-2 validation set (872 labeled examples, stanfordnlp/sst2 on Hugging
// Face) — the benchmark this model family is actually trained and reported
// on, instead of leaving classification-quality cells blank in a comparison
// table or inventing a number.
//
// Data file: a local JSON dump of the official SST-2 validation split,
// fetched once via the public Hugging Face datasets-server API
// (https://datasets-server.huggingface.co/rows?dataset=stanfordnlp/sst2...).
// Not checked into the repo (dataset license is Hugging Face's, not ours to
// redistribute); regenerate with the one-off fetch script referenced in the
// paper's appendix, or point SST2_PATH at your own copy.
//
// Run with:
//   cd apps/api
//   SST2_PATH=/path/to/sst2_validation.json npx ts-node --compiler-options '{"module":"commonjs"}' src/scripts/evalSentimentModel.ts

import * as fs from "fs";
import { pipeline } from "@xenova/transformers";

interface SST2Row {
  idx: number;
  sentence: string;
  label: 0 | 1; // 0 = negative, 1 = positive
}

async function main() {
  const dataPath = process.env.SST2_PATH;
  if (!dataPath) {
    console.error("Set SST2_PATH to the local sst2_validation.json file.");
    process.exit(1);
  }

  const rows: SST2Row[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`Loaded ${rows.length} labeled SST-2 validation examples.`);

  const sentiment = await pipeline(
    "sentiment-analysis",
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
  );

  let correct = 0;
  let tp = 0, fp = 0, tn = 0, fn = 0; // "positive" = positive class

  const BATCH = 16;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const texts = batch.map((r) => r.sentence);
    const results = (await sentiment(texts)) as { label: string; score: number }[];

    for (let j = 0; j < batch.length; j++) {
      const predicted = results[j].label === "POSITIVE" ? 1 : 0;
      const actual = batch[j].label;
      if (predicted === actual) correct++;

      if (actual === 1 && predicted === 1) tp++;
      else if (actual === 0 && predicted === 1) fp++;
      else if (actual === 0 && predicted === 0) tn++;
      else if (actual === 1 && predicted === 0) fn++;
    }

    if ((i / BATCH) % 10 === 0) {
      console.log(`  ...${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }
  }

  const accuracy = correct / rows.length;
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = (2 * precision * recall) / (precision + recall || 1);

  console.log("\n==================== SST-2 VALIDATION RESULTS ====================");
  console.log(`Model: Xenova/distilbert-base-uncased-finetuned-sst-2-english (Skyler AI's actual sentiment model)`);
  console.log(`Dataset: stanfordnlp/sst2, validation split, n=${rows.length}`);
  console.log(`Accuracy:  ${(accuracy * 100).toFixed(2)}%  (${correct}/${rows.length} correct)`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`F1:        ${(f1 * 100).toFixed(2)}%`);
  console.log(`Confusion: TP=${tp} FP=${fp} TN=${tn} FN=${fn}`);
  console.log("====================================================================");

  console.log(
    JSON.stringify(
      {
        model: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
        dataset: "stanfordnlp/sst2 validation",
        n: rows.length,
        accuracyPct: Number((accuracy * 100).toFixed(2)),
        precisionPct: Number((precision * 100).toFixed(2)),
        recallPct: Number((recall * 100).toFixed(2)),
        f1Pct: Number((f1 * 100).toFixed(2)),
        confusion: { tp, fp, tn, fn },
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
