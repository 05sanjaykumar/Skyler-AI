# paper/

Conference-paper draft documenting a performance bug found in Skyler AI's email classification pipeline, the research gap in the published literature that motivated the fix, and the fix itself.

- [`skyler-ai-conference-paper.md`](./skyler-ai-conference-paper.md) — the draft. Sections: Abstract, Related Work / Research Gap, Problem Statement, System Overview, Proposed Improvement, Implementation, Results, Discussion/Limitations, Conclusion, References, and an appendix with the exact benchmark script used.

## What this documents

`apps/api/src/AI_Services/gmail_AI/emailClassifier.ts` was re-initializing its local DistilBERT/MiniLM models from scratch on **every** `/api/gmail/pull/:instanceId` request that had an AI filter rule attached, and was embedding sentences one at a time instead of in a batch. That is the main reason email pulls with AI filtering felt slow. The fix (a warm, process-wide model singleton + batched embedding calls) is already applied to the codebase; this paper is the write-up of *why* it was slow, what the literature does and doesn't already say about this exact problem, and measured before/after numbers.

## Before you submit this anywhere

1. Reformat into your target venue's template (IEEE/ACM two-column, a Springer CCIS template, etc.) — this draft is plain Markdown.
2. Re-verify the reference list (Section "References") against the actual venues' citation style.
3. The benchmark in Section 6–7 is a small, single-machine, informal measurement (see "Limitations" in the paper) — if your conference expects rigorous empirical evaluation, re-run it with multiple trials and report variance before submitting, and say so honestly rather than presenting single-run numbers as definitive.
4. Fill in your own name/affiliation/course details at the top.
