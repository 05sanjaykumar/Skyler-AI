// src/lib/rules-engine.ts
import { getEmbedder, cosineSim } from "./local-nlp";

export type Rule = {
  id: string;
  text: string;          // natural language rule/intent
  template?: string;     // reply template, can include {{sender}}, {{subject}}, {{snippet}}
  threshold?: number;    // 0..1, default 0.55
};

export async function findBestRule(emailBody: string, rules: Rule[]) {
  if (!rules.length || !emailBody.trim()) return null;

  const embedder = await getEmbedder();
  const [emailVec] = await embedder(emailBody, { pooling: "mean", normalize: true });

  let best: { rule: Rule; score: number } | null = null;

  // embed rules in batch for speed
  const ruleTexts = rules.map(r => r.text);
  const ruleVecs = await embedder(ruleTexts, { pooling: "mean", normalize: true });

  for (let i = 0; i < rules.length; i++) {
    const score = cosineSim(emailVec, ruleVecs[i]);
    if (rules[i] && (!best || score > best.score)) best = { rule: rules[i] as Rule, score };
  }

  // respect per-rule threshold (default 0.55)
  if (best && best.score >= (best.rule.threshold ?? 0.55)) return best;
  return null;
}

export function fillTemplate(
  tpl: string,
  ctx: Record<string, string | number | undefined>
) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(ctx[k] ?? ""));
}
