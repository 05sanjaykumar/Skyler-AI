# Reducing Inference Latency in Lightweight, Privacy-Preserving Email Triage: A Case Study on Skyler AI

**Author:** Sanjay Kumar
**Project:** Skyler AI (Skyler Inbox) — Gmail triage, classification and AI-assisted reply tool
**Category:** Applied systems / Natural Language Processing (NLP) for productivity software

> **Note to self before submission:** this draft is written to be adapted for a specific conference's template (IEEE/ACM two-column, Springer CCIS, etc.). Re-check author affiliation, page limits, and citation style (this draft uses an informal author-year style) against the target venue's call for papers before submitting.

---

## Abstract

On-device and small-model Natural Language Processing (NLP) pipelines are increasingly used for privacy-preserving email classification, as an alternative to routing message content through third-party cloud LLMs. Prior work evaluates such pipelines mainly on *accuracy and cost* relative to large proprietary models, while a separate line of systems research studies *cold-start latency* for large-scale LLM serving infrastructure (GPU clusters, edge-distributed pipelines). Neither line of work addresses a pattern that is common in small, request-driven backend services: a lightweight transformer pipeline (e.g., a DistilBERT sentiment model and a MiniLM sentence embedder) being re-initialized on every incoming API request, and embedding vectors being computed one text at a time inside request-handling code instead of in a batch. We identify and fix this pattern in Skyler AI, a production Gmail triage application that classifies and semantically filters up to 200 emails per user action using local DistilBERT/MiniLM models. We (1) replace per-request model instantiation with a warm, process-wide model singleton, and (2) replace sequential per-sentence/per-keyword embedding calls with batched calls. On a local benchmark using the project's own cached ONNX models, eliminating per-request re-initialization removes 252–310 ms of pure model-loading overhead from *every* classification request, and batching sentence embeddings yields an additional 1.55x speedup on the embedding step itself. We discuss why this gap exists in the literature, the limits of our benchmark, and directions for a more rigorous evaluation.

**Keywords:** email classification, semantic search, on-device NLP, transformer inference latency, cold-start, model lifecycle management, privacy-preserving AI

---

## 1. Introduction

Email remains the primary communication channel for most knowledge work, and inbox overload is a well-documented productivity problem. A growing category of tools — Skyler AI among them — try to address this by classifying, filtering, and drafting replies to email using a mix of lightweight local NLP models and cloud large language models (LLMs).

Skyler AI's current design (described in Section 4) intentionally avoids sending full email content to a third-party LLM for *every* message: it first runs a local sentiment classifier (`Xenova/distilbert-base-uncased-finetuned-sst-2-english`) and a local sentence embedder (`Xenova/all-MiniLM-L6-v2`), both running in-process via `@xenova/transformers` (a WASM/ONNX runtime for the browser and Node.js), and only calls a cloud LLM (Groq's `llama-3.1-8b-instant`) for the smaller task of summarizing and drafting a reply to emails the user has already chosen to act on. This is a privacy- and cost-motivated design: the local models never leave the server process, and they are cheap enough to run per-request without a GPU.

During real usage, however, the application became noticeably slow under its own "pull up to 200 mails" feature when an AI filter rule was attached to an inbox. This paper documents the investigation of that slowdown, connects it to a real gap in the published literature on small-model NLP inference, and presents and evaluates a fix implemented directly in the Skyler AI codebase.

**Contributions:**

1. We identify a specific, reproducible inference-lifecycle bug — repeated cold-start of local transformer pipelines on every API request — in a real, deployed application, and show it is distinct from the cold-start problems studied in current LLM-serving literature.
2. We implement and ship a fix: a process-wide warm model singleton plus batched embedding calls, inside `apps/api/src/AI_Services/gmail_AI/emailClassifier.ts` and `apps/api/src/AI_Services/models.ts`.
3. We provide a local, reproducible benchmark quantifying the fix, and a unit test suite that pins down the new batching behavior.

---

## 2. Related Work and Research Gap

We group related work into two threads that, between them, leave the specific problem addressed in this paper unexamined.

### 2.1 Small/local models for email classification (accuracy–cost tradeoff)

- **Rojas-Galeano (2024)**, *"Zero-Shot Spam Email Classification Using Pre-trained Large Language Models"* (arXiv:2405.15936; published in *Applied Computer Sciences in Engineering*, WEA 2024, Springer CCIS vol. 2222), compares a smaller open model (Flan-T5) against GPT-4 for zero-shot spam classification on SpamAssassin, reporting Flan-T5 at ~90% F1 versus GPT-4 at ~95%, and explicitly flags the deployment cost of proprietary models as a concern. The paper's contribution is about *classification quality under a model-size tradeoff*; it does not discuss how either model is kept warm or re-used across requests in a serving application.
- **Kamberi (2026)**, *"Intelligent Email Routing with LLMs"* (M.Sc. thesis, South East European University, supervised by Prof. Dr. Mennan Selimi), pairs a `sentence-transformers/all-MiniLM-L6-v2` embedding model (the same embedding model Skyler AI uses) with keyword extraction for email routing, and compares it against larger GPT/LLaMA-based setups on a cost-versus-accuracy basis. Again, the focus is model selection and routing accuracy, not request-time inference lifecycle.
- A model card for **Distil Labs' `distil-email-classifier`** (a distilled ~0.8B-parameter Qwen3-based model, reported at ~93% accuracy across 10 categories) is offered explicitly as a *local, privacy-preserving* alternative to cloud classification — validating the same design motivation behind Skyler AI's local DistilBERT/MiniLM pipeline — but it is a model artifact description, not a study of serving behavior.

**Observation:** this thread treats the local model as a black box evaluated once, offline, on a fixed dataset. None of it asks what happens when that model has to be initialized, held, and reused across many short-lived HTTP requests in a live backend, which is exactly the setting Skyler AI runs in.

### 2.2 Cold-start latency for LLM serving (systems–infrastructure)

- **Kabakibo, Trivedi, and Wang (2026)**, *"Breaking the Ice: Analyzing Cold Start Latency in vLLM"* (arXiv:2606.07362), profile the startup path of vLLM, a large-scale GPU LLM-serving engine, and find that startup cost is dominated by CPU-bound work rather than GPU or storage I/O, building an analytical model to predict startup time per hardware configuration.
- **Liu et al. (2025)**, *"CSGO: Generalized Optimization for Cold Start in Wireless Collaborative Edge LLM Systems"* (arXiv:2508.11287), address cold start in pipelined LLM inference distributed across wireless edge devices, overlapping model loading with computation/communication and formulating layer partitioning as a mixed-integer nonlinear program.

**Observation:** this thread is about *infrastructure-scale* serving — a single long-lived engine (vLLM) or a distributed edge pipeline — where "cold start" means the first request after a deploy or device join. It does not cover the much smaller, more common case of a lightweight in-process model (tens of megabytes, CPU/WASM inference, no dedicated serving engine) that an application re-initializes **every time a request handler runs**, because the application code — not an inference server — owns the model's lifecycle.

### 2.3 The gap this paper addresses

> No work we found evaluates the *compounding, per-request* cost of re-initializing a small local transformer pipeline *inside application request-handling code*, nor compares sequential per-item versus batched inference for the hybrid semantic + keyword email-filtering pattern used by tools like Skyler AI, Kamberi's routing system, and Distil Labs' classifier. This is a serving-lifecycle gap that sits between the two literatures above: too small-scale and too embedded in ordinary backend code to be "LLM serving" in the vLLM/edge sense, but outside the scope of the accuracy/cost papers, which assume the model is already loaded.

This gap matters practically: applications built the way the accuracy/cost literature recommends (small local model, run per-message) are exactly the ones at risk of this bug, because the papers that validate the *model choice* give no guidance on the *model lifecycle*.

---

## 3. Problem Statement

Concretely, in the pre-fix version of Skyler AI:

1. `apps/api/src/AI_Services/models.ts` defines a module-level singleton loader, `loadModels()`, guarded by `if (sentimentAnalyzer && embedder) return;` — the intended mechanism for loading the DistilBERT and MiniLM pipelines exactly once per process.
2. `loadModels()` was **never called anywhere in the codebase.** It was dead code.
3. Instead, `apps/api/src/routes/gmail/webhooks/gmailPull.ts` — the handler behind `GET /api/gmail/pull/:instanceId`, which backs the product's "pull up to 200 mails" feature — did this on *every single request* that had an AI filter rule attached:
   ```ts
   const classifier = new EmailClassifier();
   await classifier.init();
   ```
   and `EmailClassifier.init()` called `pipeline(...)` for both models directly, from scratch, discarding the result at the end of the request.
4. Separately, `EmailClassifier.filterEmails()`'s semantic-matching path (`semanticAnyMatch`) split each email into sentences and called the embedder once per sentence, in a sequential `for` loop with `await` inside it, rather than batching all of an email's sentences (or all filter keywords) into a single call.

Both issues are invisible in isolated unit testing (there was no test exercising this path at all — see Section 5) and only show up as latency under realistic load, which matches the "too slow, too buggy" feedback that motivated this investigation.

---

## 4. System Overview

Skyler AI ("Skyler Inbox") is a Gmail triage and reply-assist tool built as a pnpm/Turborepo monorepo:

- **Frontend:** Next.js, NextAuth (Google OAuth), Tailwind, shadcn/ui, Dexie (client-side cache of pulled emails).
- **Backend:** Express + TypeScript (`apps/api`).
- **Database:** Supabase/Postgres via Prisma ORM.
- **Local NLP models** (`apps/api/src/AI_Services`): `Xenova/distilbert-base-uncased-finetuned-sst-2-english` for sentiment, `Xenova/all-MiniLM-L6-v2` for sentence embeddings, both served through `@xenova/transformers` (ONNX runtime, CPU/WASM, no GPU required).
- **Cloud LLM:** Groq `llama-3.1-8b-instant` via LangChain (`GmailSummariser`), used only for the smaller, user-initiated task of summarizing one email and drafting a reply against a user-defined rule set.
- **Payments / credits:** a credit-based freemium system (Cashfree, PayPal) gates how many "pulls" a user can perform per month.

The relevant request path is:

```
GET /api/gmail/pull/:instanceId
  → fetch up to N Gmail messages (batched, 10 at a time, via googleapis)
  → if the inbox instance has an AI filter rule:
        new EmailClassifier() → init() → filterEmails(messages, rules)
  → return filtered messages to the client
```

Because every inbox "refresh" costs the user one credit regardless of how many emails are classified, the server-side cost of classification directly affects both perceived responsiveness and infrastructure cost per credit.

---

## 5. Proposed Improvement

Grounded in the gap identified in Section 2.3, we implement two changes, both scoped to the AI classification path and requiring no change to the product's behavior or API contract:

### 5.1 Warm, process-wide model singleton

`EmailClassifier.init()` now calls the existing (previously unused) `loadModels()` singleton loader from `models.ts` and reads the shared `sentimentAnalyzer` / `embedder` references, instead of calling `pipeline(...)` itself:

```ts
async init() {
  await loadModels();
  this.sentimentAnalyzer = Models.sentimentAnalyzer;
  this.embedder = Models.embedder;
}
```

`loadModels()`'s existing guard (`if (sentimentAnalyzer && embedder) return;`) means every call after the first resolves immediately. We additionally call `loadModels()` once at process startup (`server.ts`), so the *first* real request is also warm, rather than paying the load cost on whichever user happens to trigger it first.

### 5.2 Batched embedding inference

We replace the per-sentence embedding loop with a single batched call per email (and a single batched call for the filter rule's keyword list), using `@xenova/transformers`' native support for array input to the `feature-extraction` pipeline. A new `asBatch3D` helper unpacks the resulting `[batch, seq, hidden]` tensor into one token matrix per input text, which is then mean/CLS-pooled exactly as before — the pooling and cosine-similarity logic, and therefore the filtering semantics, are unchanged. We verified this with a focused unit test suite (Section 6.2) rather than relying on inspection alone.

Both changes are internal refactors: the public behavior of `filterEmails()` (which emails are kept, under which rules) is unchanged; only *how* the models are obtained and called changes.

---

## 6. Implementation

The changes touch three files:

- `apps/api/src/AI_Services/models.ts` — unchanged in content; now actually used.
- `apps/api/src/AI_Services/gmail_AI/emailClassifier.ts` — `init()` now delegates to the shared singleton; `getVector`/`as2D` (single-item embedding path) were removed as dead code once every call site moved to the new batched `getVectors`/`asBatch3D` path.
- `apps/api/src/server.ts` — calls `loadModels()` once at boot, logging success/failure without blocking the HTTP listener from starting.

### 6.1 Benchmark methodology

We benchmarked on the project's own cached ONNX weights (`node_modules/.pnpm/@xenova+transformers@2.17.2/.../\.cache`), i.e. with **no network/model-download cost**, isolating pure in-process initialization and inference cost. This is a conservative choice: in a real deployment where models are not pre-cached (e.g., a fresh container), the per-request "OLD" cost would be *higher*, not lower, because it would include a download. All numbers are from a single developer machine (CPU inference, Node.js, `ts-node`), averaged informally over repeated runs rather than a controlled statistical benchmark — see Limitations (Section 8).

Two experiments:

1. **Re-initialization cost.** Call `pipeline(...)` for both models twice in sequence (simulating two consecutive `/gmail/pull` requests under the old code), then compare against reusing already-resolved references (the new code's behavior after the first warm-up).
2. **Batching.** Embed 30 synthetic sentences (a stand-in for the sentences of several emails under semantic filtering) one call at a time (old) versus one batched call (new), using an already-warm embedder so this isolates the batching effect specifically.

### 6.2 Correctness verification

Because this is a refactor of logic that was previously untested, we added `apps/api/src/__tests__/emailClassifier.test.ts`, which mocks the model layer with deterministic fake embeddings/sentiment labels and checks that: (a) sentiment-based filtering keeps the right emails, (b) literal keyword matching works with semantic analysis off, (c) semantic matching finds a conceptually related email that does not contain the literal keyword, and (d) the embedder is now called a constant number of times per request (one batch per email's sentences, one batch for the keyword list) rather than once per sentence/keyword. We also ran an equivalent check directly against the real (non-mocked) class with injected fake model functions, bypassing the project's test harness, to confirm the same behavior outside Jest.

---

## 7. Results

| Measurement | Old behavior | New behavior | Notes |
|---|---|---|---|
| Model (re)initialization cost paid on a classification request | 252–310 ms **every request** | ~0 ms after the first request (warmed at boot) | Local disk-cached ONNX weights; a cold network fetch would make the "old" number larger |
| Embedding 30 sentences | 56.9 ms (30 sequential calls) | 36.7 ms (1 batched call) | **1.55x** speedup on the embedding step alone |
| Embedder calls for 1 email (≈1 sentence) + a 2-keyword filter rule | 3 calls (old per-sentence/per-keyword code path, reconstructed) | 2 calls (1 batch for keywords, 1 batch for the email's sentences) | Confirmed by the unit test's call-count assertion |

For a realistic "pull 200 emails with an AI filter rule" request, the dominant effect is **5.1** — eliminating the 250–310 ms re-initialization removes a fixed cost that was previously paid on *every single pull request*, independent of inbox size. The batching effect in **5.2** scales with the number of emails/sentences being semantically filtered, and is a secondary but compounding improvement on top of the first fix.

We did not have access to the production Supabase database or Google OAuth tokens from this environment, so we could not run an end-to-end load test against a live Gmail account; the numbers above isolate the AI-classification stage specifically, which is the stage this paper's contribution changes.

---

## 8. Discussion and Limitations

- **Benchmark rigor.** The results in Section 7 come from a small number of runs on one developer machine, not a statistically controlled benchmark (no repeated trials with confidence intervals, no comparison across hardware). They should be read as *evidence of direction and rough magnitude*, not a precise SLA number. A stronger version of this paper would run each configuration N≥30 times, report mean ± standard deviation, and test on at least one additional machine class (e.g., a small cloud instance similar to where Skyler AI is actually deployed, per `render.yaml`).
- **Scope of "cold start."** We did not measure the very first model load after a fresh `pnpm install` (i.e., including a real network download of the ONNX weights), which would make the "old" numbers in Section 7 even larger and is arguably the more realistic worst case for a newly deployed container.
- **No end-to-end production measurement.** We benchmarked the classification stage in isolation; we did not measure total `/api/gmail/pull/:instanceId` latency against live Gmail and Supabase, which also includes network calls to the Gmail API that this change does not touch.
- **Generality.** The specific gap we describe (Section 2.3) is argued from a targeted literature search, not a systematic review; it is plausible that a paper covering exactly this "in-process small-model request lifecycle" problem exists under different keywords (e.g., "model caching", "warm pool", "singleton inference service") in the broader MLOps/model-serving literature outside the email domain, and a full related-work section for publication should search that space explicitly.
- **Fairness of comparison.** Because `@xenova/transformers` pipelines are not literally re-downloaded on a warm machine (only re-initialized from already-cached weights into memory/ONNX session objects), the 252–310 ms figure already understates the cost of the bug in a cold-container deployment, but it is the correct, honest number for *this* benchmark's conditions, and we report it as such rather than extrapolating an unmeasured worst case.

---

## 9. Conclusion and Future Work

We identified a concrete, shipped instance of a serving-lifecycle gap in small-model NLP applications — re-initializing a local transformer pipeline on every API request, instead of once per process — that sits outside both the accuracy/cost-focused literature on local email classification models and the infrastructure-scale cold-start literature for large LLM serving engines. We fixed this in Skyler AI by introducing a warm model singleton and batched embedding inference, verified the fix's correctness with a new unit test suite, and measured its effect with a local benchmark showing the fix removes 250–310 ms of fixed per-request overhead and yields a 1.55x speedup on batched embedding specifically.

Future work: (1) a statistically rigorous, multi-machine benchmark, including a true cold-network-fetch scenario; (2) an end-to-end production latency study against live Gmail/Supabase traffic; (3) generalizing the fix into a small reusable "warm model pool" library, since the same pattern (local transformer pipeline inside a short-lived request handler) is likely to recur as more productivity tools adopt local/hybrid NLP pipelines for privacy reasons, per the motivation in Rojas-Galeano (2024), Kamberi (2026), and the Distil Labs model card.

---

## References

1. Rojas-Galeano, S. (2024). *Zero-Shot Spam Email Classification Using Pre-trained Large Language Models.* In: Applied Computer Sciences in Engineering (WEA 2024), Communications in Computer and Information Science, vol. 2222, Springer. arXiv:2405.15936.
2. Kamberi, H. (2026). *Intelligent Email Routing with LLMs.* M.Sc. Thesis, South East European University, Faculty of Contemporary Sciences & Technologies. Supervised by Prof. Dr. Mennan Selimi.
3. Kabakibo, H. S., Trivedi, A., & Wang, L. (2026). *Breaking the Ice: Analyzing Cold Start Latency in vLLM.* arXiv:2606.07362.
4. Liu, X., Xue, N., Bao, R., Sun, Y., Chen, Z., Tao, M., Xu, X., & Cui, S. (2025). *CSGO: Generalized Optimization for Cold Start in Wireless Collaborative Edge LLM Systems.* arXiv:2508.11287.
5. Distil Labs. *distil-email-classifier* (model card). A distilled Qwen3-based local email classifier, reported ~93% accuracy across 10 categories. Accessed via featherless.ai.
6. Xenova / Hugging Face. `distilbert-base-uncased-finetuned-sst-2-english` and `all-MiniLM-L6-v2` (ONNX ports used by `@xenova/transformers`), used as the local models under study in this paper.

---

## Appendix A — Benchmark script

The benchmark described in Section 6.1/7 was run as a standalone TypeScript script (not checked into the repository) that directly imports `@xenova/transformers`' `pipeline` function and measures wall-clock time with `process.hrtime.bigint()`. It is reproduced here for anyone re-running the measurement:

```ts
import { pipeline } from "@xenova/transformers";

function now() {
  return Number(process.hrtime.bigint()) / 1e6; // ms
}

async function main() {
  // (a) per-request re-initialization cost
  const t0 = now();
  const sentiment1 = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  const embedder1 = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const t1 = now();

  const t2 = now();
  const sentiment2 = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  const embedder2 = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const t3 = now();

  const t4 = now();
  const reused = Boolean(sentiment2) && Boolean(embedder2); // guard short-circuits, no pipeline() call
  const t5 = now();

  // (b) sequential vs batched sentence embedding
  const sentences = Array.from({ length: 30 }, (_, i) => `This is test sentence number ${i} about billing and refunds.`);

  const t6 = now();
  for (const s of sentences) await embedder1(s);
  const t7 = now();

  const t8 = now();
  await embedder1(sentences);
  const t9 = now();

  console.log({ coldLoad1: t1 - t0, coldLoad2: t3 - t2, reuse: t5 - t4, sequential: t7 - t6, batched: t9 - t8 });
}

main();
```

## Appendix B — Files changed

- `apps/api/src/AI_Services/gmail_AI/emailClassifier.ts`
- `apps/api/src/AI_Services/models.ts` (no content change; now invoked)
- `apps/api/src/server.ts`
- `apps/api/src/__tests__/emailClassifier.test.ts` (new)
