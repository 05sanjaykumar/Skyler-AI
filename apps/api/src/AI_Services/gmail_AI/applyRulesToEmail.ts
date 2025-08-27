// // apps/api/src/AI_Services/gmail_AI/applyRules.ts
// import { loadModels, embedder, summarizer } from "../models";

// // cosineSimilarity helper
// function cosineSimilarity(a: number[], b: number[]): number {
//   let dot = 0, na = 0, nb = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot += a[i] * b[i];
//     na += a[i] * a[i];
//     nb += b[i] * b[i];
//   }
//   const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-12;
//   return dot / denom;
// }

// export async function applyRulesToEmail(
//   email: { body: string; subject?: string },
//   rules: { id: string; text: string }[]
// ) {
//   await loadModels();

//   // 1. Summarize email
//   const summaryRes = await summarizer(
//     `Summarize this email in one sentence:\n${email.body}`
//   );
//   const summary = summaryRes[0].generated_text.trim();

//   // 2. Embed email + rules
//   const emailVec = (await embedder(summary))[0][0] as number[];
//   const scores = await Promise.all(
//     rules.map(async (rule) => {
//       const ruleVec = (await embedder(rule.text))[0][0] as number[];
//       return { rule, score: cosineSimilarity(emailVec, ruleVec) };
//     })
//   );

//   // 3. Pick best match
//   const bestMatch = scores.sort((a, b) => b.score - a.score)[0];

//   // 4. If similarity is very high, return the rule directly
//   if (bestMatch.score > 0.85) {
//     return {
//       summary,
//       bestRule: bestMatch.rule,
//       draft: bestMatch.rule.text,
//       scores,
//     };
//   }

//   // 5. Otherwise, draft a professional, friendly reply
//   const draftRes = await summarizer(`
// You are a professional assistant.
// Draft a complete, polite, and friendly email reply to the user’s message.
// Use the rule below **exactly as guidance**. Do NOT add greetings, signatures, or extra commentary.
// Always write at least 2-3 full sentences.
// If the rule is highly relevant, use it directly. Otherwise, rewrite the reply clearly using the rule.

// User Email: {summary}
// Rule Guidance: {bestMatch.rule.text}
// Reply:

//   `,
//   {
//      max_new_tokens: 150,  // make sure it can generate multiple sentences
//     do_sample: true,      // allows variability
//     temperature: 0.7,     // friendly but not random
//     top_p: 0.9,
//   }
// );


//   return {
//     summary,
//     bestRule: bestMatch.rule,
//     draft: draftRes[0].generated_text.trim(),
//     scores,
//   };
// }
