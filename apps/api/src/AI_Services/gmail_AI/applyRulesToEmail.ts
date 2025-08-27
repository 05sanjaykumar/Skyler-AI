// apps/api/src/AI_Services/gmail_AI/applyRules.ts
import { loadModels, embedder, summarizer } from "../models";

// cosineSimilarity helper
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-12;
  return dot / denom;
}

export async function applyRulesToEmail(
  email: { body: string; subject?: string },
  rules: { id: string; text: string }[]
) {
  await loadModels();

  // 1. Summarize email
  const summaryRes = await summarizer(`Summarize this email in one sentence:\n${email.body}`);
  const summary = summaryRes[0].generated_text;

  // 2. Embed email + rules
  const emailVec = (await embedder(summary))[0][0] as number[];

  const scores = await Promise.all(
    rules.map(async (rule) => {
      const ruleVec = (await embedder(rule.text))[0][0] as number[];
      return { rule, score: cosineSimilarity(emailVec, ruleVec) };
    })
  );

  // 3. Pick best match
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];

  // 4. Draft reply using rule
  const draftRes = await summarizer(`
    Draft a professional reply.
    Rule: ${bestMatch.rule.text}
    Email: ${summary}
  `);

  return {
    summary,
    bestRule: bestMatch.rule,
    draft: draftRes[0].generated_text,
    scores,
  };
}
