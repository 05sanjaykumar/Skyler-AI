// apps/api/src/scripts/evalFilteringAccuracy.ts
//
// Measures the thing nobody else in this project's literature comparison
// measures: not a single classifier's accuracy on a single label (that's
// Section 7.4 / evalSentimentModel.ts, against the real SST-2 benchmark),
// but whether Skyler AI's actual, combined, multi-signal rule — sentiment
// AND (keyword OR semantic similarity) — correctly decides to keep or
// discard a real email.
//
// There is no public, labeled "should this rule keep this email" dataset
// (that's exactly the limitation the paper states in Section 8), so this
// is a self-constructed test set with ground truth assigned BEFORE running
// the classifier, by deliberate construction rather than human judgement
// call on each example: every email is built from one of four quadrants
// crossing (sentiment: clearly positive / clearly negative) x (topic:
// on-topic for the rule / off-topic), so the correct keep/discard answer
// follows mechanically from how the email was generated, not from eyeballing
// borderline cases. Within "on-topic," half the emails use the rule's
// literal keywords and half are paraphrased WITHOUT them, specifically to
// exercise (and honestly measure) the semantic-similarity path, not just
// literal substring matching.
//
// Run with:
//   cd apps/api
//   npx ts-node --compiler-options '{"module":"commonjs"}' src/scripts/evalFilteringAccuracy.ts

import { EmailClassifier } from "../AI_Services/gmail_AI/emailClassifier";

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

interface LabeledEmail {
  email: Email;
  expectedKeep: boolean;
  quadrant: "positive+onTopicLiteral" | "positive+onTopicSemantic" | "positive+offTopic" | "negative+onTopicLiteral" | "negative+onTopicSemantic" | "negative+offTopic";
}

// --- The rule under test ------------------------------------------------
// A realistic configuration a Skyler AI user might set on an inbox: keep
// positive-sentiment emails that are about refunds/invoices/payments,
// matched either literally or semantically.
// Default here (0.35) matches the production default after the fix this
// script's findings motivated (see emailClassifier.ts). Override with
// EVAL_THRESHOLD to reproduce the sweep that found it (0.6/0.5 -> F1 60.5%;
// 0.35 -> F1 90.9%).
const RULE = {
  sentiment: "positive" as const,
  keywords: ["refund", "invoice", "payment"],
  requiresSemanticAnalysis: true,
  similarityThreshold: Number(process.env.EVAL_THRESHOLD ?? 0.35),
};

// --- Ground-truth construction -------------------------------------------

const POSITIVE_PHRASES = [
  "Thank you so much, this was handled wonderfully.",
  "I'm really happy with how quickly this got resolved.",
  "Great service, I truly appreciate the effort here.",
  "Excellent, this made my whole week better.",
  "I'm delighted with the outcome, thank you for your help.",
  "Wonderful experience overall, couldn't be happier.",
  "This is fantastic news, thanks a lot for sorting it out.",
  "I appreciate how smoothly everything went, great job.",
  "Really pleased with the support I received today.",
  "What a relief, thank you for handling this so well.",
];

const NEGATIVE_PHRASES = [
  "This is absolutely unacceptable and I'm very upset.",
  "I'm extremely disappointed with how this was handled.",
  "Terrible experience, I'm frustrated beyond words.",
  "This is the worst service I've ever received.",
  "I'm furious about how long this has taken.",
  "Completely dissatisfied, this needs to be fixed immediately.",
  "I'm annoyed that nobody has responded properly.",
  "This has been a horrible, stressful ordeal.",
  "I regret ever dealing with this, very poor experience.",
  "I'm upset and honestly quite angry about this situation.",
];

const ON_TOPIC_LITERAL = [
  "regarding my refund request for order {n}",
  "about the invoice you sent for {n}",
  "concerning my payment for subscription {n}",
  "my refund for item {n} still needs processing",
  "the invoice number {n} has a question attached",
  "about the payment confirmation for transaction {n}",
];

const ON_TOPIC_SEMANTIC = [
  "you charged me twice for order {n} and I'd like my money back",
  "the bill for last month's subscription {n} needs a second look",
  "I sent money for service {n} and want confirmation it went through",
  "could you reverse the charge from transaction {n}",
  "the amount billed to me for {n} seems off, please review it",
  "I'd like to be reimbursed for order {n}",
];

const OFF_TOPIC = [
  "about the team meeting scheduled for next {n}",
  "the newsletter update for this {n}",
  "a quick question about the office party on {n}",
  "the weather forecast mentioned in update {n}",
  "a reminder about the parking situation near building {n}",
  "an update on the new coffee machine in room {n}",
  "the schedule change for the gym class on {n}",
  "a note about the book club meeting on {n}",
];

function buildEmails(): LabeledEmail[] {
  const out: LabeledEmail[] = [];
  let id = 0;

  const push = (subject: string, snippet: string, expectedKeep: boolean, quadrant: LabeledEmail["quadrant"]) => {
    id++;
    out.push({
      email: {
        id: String(id),
        threadId: `t${id}`,
        date: new Date().toISOString(),
        from: `sender${id}@example.com`,
        subject,
        snippet,
        aiContent: null,
        body: null,
      },
      expectedKeep,
      quadrant,
    });
  };

  // positive + on-topic (literal) -> KEEP
  for (let i = 0; i < 15; i++) {
    const tone = POSITIVE_PHRASES[i % POSITIVE_PHRASES.length];
    const topic = ON_TOPIC_LITERAL[i % ON_TOPIC_LITERAL.length].replace("{n}", String(i));
    push(`Update ${i}`, `${tone} Writing ${topic}.`, true, "positive+onTopicLiteral");
  }

  // positive + on-topic (semantic only, no literal keyword) -> KEEP
  for (let i = 0; i < 15; i++) {
    const tone = POSITIVE_PHRASES[(i + 3) % POSITIVE_PHRASES.length];
    const topic = ON_TOPIC_SEMANTIC[i % ON_TOPIC_SEMANTIC.length].replace("{n}", String(i));
    push(`Note ${i}`, `${tone} Also, ${topic}.`, true, "positive+onTopicSemantic");
  }

  // positive + off-topic -> DISCARD (sentiment OK, content not matched)
  for (let i = 0; i < 15; i++) {
    const tone = POSITIVE_PHRASES[(i + 5) % POSITIVE_PHRASES.length];
    const topic = OFF_TOPIC[i % OFF_TOPIC.length].replace("{n}", String(i));
    push(`FYI ${i}`, `${tone} Just ${topic}.`, false, "positive+offTopic");
  }

  // negative + on-topic (literal) -> DISCARD (content matches, sentiment doesn't)
  for (let i = 0; i < 15; i++) {
    const tone = NEGATIVE_PHRASES[i % NEGATIVE_PHRASES.length];
    const topic = ON_TOPIC_LITERAL[(i + 2) % ON_TOPIC_LITERAL.length].replace("{n}", String(i));
    push(`Complaint ${i}`, `${tone} Writing ${topic}.`, false, "negative+onTopicLiteral");
  }

  // negative + on-topic (semantic only) -> DISCARD
  for (let i = 0; i < 15; i++) {
    const tone = NEGATIVE_PHRASES[(i + 4) % NEGATIVE_PHRASES.length];
    const topic = ON_TOPIC_SEMANTIC[(i + 1) % ON_TOPIC_SEMANTIC.length].replace("{n}", String(i));
    push(`Issue ${i}`, `${tone} Also, ${topic}.`, false, "negative+onTopicSemantic");
  }

  // negative + off-topic -> DISCARD
  for (let i = 0; i < 15; i++) {
    const tone = NEGATIVE_PHRASES[(i + 6) % NEGATIVE_PHRASES.length];
    const topic = OFF_TOPIC[(i + 3) % OFF_TOPIC.length].replace("{n}", String(i));
    push(`Reminder ${i}`, `${tone} Just ${topic}.`, false, "negative+offTopic");
  }

  return out;
}

// --- Run ------------------------------------------------------------------

async function main() {
  const labeled = buildEmails();
  console.log(`Built ${labeled.length} labeled emails (ground truth assigned by construction, not by eyeballing).`);

  const classifier = new EmailClassifier();
  await classifier.init();

  const decisions = await classifier.filterEmailsWithReasons(
    labeled.map((l) => l.email),
    RULE
  );

  let tp = 0, fp = 0, tn = 0, fn = 0;
  const byQuadrant: Record<string, { correct: number; total: number }> = {};

  for (let i = 0; i < labeled.length; i++) {
    const expected = labeled[i].expectedKeep;
    const actual = decisions[i].kept;
    const q = labeled[i].quadrant;
    byQuadrant[q] ??= { correct: 0, total: 0 };
    byQuadrant[q].total++;
    if (expected === actual) byQuadrant[q].correct++;

    if (expected && actual) tp++;
    else if (!expected && actual) fp++;
    else if (!expected && !actual) tn++;
    else if (expected && !actual) fn++;
  }

  const total = labeled.length;
  const accuracy = (tp + tn) / total;
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = (2 * precision * recall) / (precision + recall || 1);

  console.log("\n==================== FILTERING ACCURACY RESULTS ====================");
  console.log(`Rule: sentiment=positive AND (keyword[refund,invoice,payment] OR semantic>=0.5)`);
  console.log(`n=${total}`);
  console.log(`Accuracy:  ${(accuracy * 100).toFixed(1)}%  (${tp + tn}/${total} correct)`);
  console.log(`Precision: ${(precision * 100).toFixed(1)}%`);
  console.log(`Recall:    ${(recall * 100).toFixed(1)}%`);
  console.log(`F1:        ${(f1 * 100).toFixed(1)}%`);
  console.log(`Confusion: TP=${tp} FP=${fp} TN=${tn} FN=${fn}`);
  console.log("\nAccuracy by quadrant (where errors actually come from):");
  for (const [q, v] of Object.entries(byQuadrant)) {
    console.log(`  ${q}: ${v.correct}/${v.total} (${((v.correct / v.total) * 100).toFixed(0)}%)`);
  }
  console.log("========================================================================");

  console.log(
    JSON.stringify(
      {
        rule: RULE,
        n: total,
        accuracyPct: Number((accuracy * 100).toFixed(1)),
        precisionPct: Number((precision * 100).toFixed(1)),
        recallPct: Number((recall * 100).toFixed(1)),
        f1Pct: Number((f1 * 100).toFixed(1)),
        confusion: { tp, fp, tn, fn },
        byQuadrant: Object.fromEntries(
          Object.entries(byQuadrant).map(([k, v]) => [k, { correct: v.correct, total: v.total }])
        ),
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
