# paper/

Conference-paper draft documenting a performance bug found in Skyler AI's email classification pipeline, the research gap in the published literature that motivated the fix, and the fix itself.

- [`skyler-ai-conference-paper.md`](./skyler-ai-conference-paper.md) — the draft. Sections: Abstract, Related Work / Research Gap, Problem Statement, System Overview, Proposed Improvement, Implementation, Results, Discussion/Limitations, Conclusion, References, and an appendix with the exact benchmark script used.

## What this documents

`apps/api/src/AI_Services/gmail_AI/emailClassifier.ts` was re-initializing its local DistilBERT/MiniLM models from scratch on **every** `/api/gmail/pull/:instanceId` request that had an AI filter rule attached. That re-initialization cost (252–310 ms/request, confirmed in isolation) is the one clean, unambiguous fix in this project: a warm, process-wide model singleton, plus a `classifyMs` telemetry field on the live endpoint so the effect is checkable on real traffic. We also tried batching the embedding and sentiment-analysis calls; a reproducible, checked-in benchmark (`apps/api/src/scripts/benchmarkClassifier.ts`, runs the real production classifier at 200 emails/request) showed embedding batching is a wash on realistic variable-length text (not the clean win a uniform-length toy test suggested) and sentiment batching is a consistent ~8% *regression*, which we reverted. This paper documents all of that honestly — what worked, what didn't, and why — alongside how it compares to two real, verified 2025 IEEE conference papers in the same problem space (one of which uses the exact same DistilBERT model).

The two IEEE papers used as the direct baseline (Section 2.1 of the draft):

- Abdelhady, A. S., & Shaker, M. A. (2025). *Comprehensive Email Spam Detection Using Large Language Models.* IEEE ACDSA 2025 — [ieeexplore.ieee.org/document/11166175](https://ieeexplore.ieee.org/document/11166175/)
- La Min Ei, & Yongsiriwit, K. (2025). *Phishing Email Classification Using Few-Shot Learning with a Lightweight LLM (Llama 3.2).* IEEE InCIT 2025 — [ieeexplore.ieee.org/document/11276030](https://ieeexplore.ieee.org/document/11276030/)

Both were read directly from IEEE Xplore to pull real titles/authors/venues/abstracts rather than relying on search-snippet summaries; the second paper's results section is paywalled, so the draft only cites its verified title, authors, venue, and public introduction — not figures we couldn't read.

## Before you submit this anywhere

1. Reformat into your target venue's template (IEEE/ACM two-column, a Springer CCIS template, etc.) — this draft is plain Markdown.
2. Re-verify the reference list (Section "References") against the actual venues' citation style.
3. The realistic-scale benchmark (Section 6.3/7.2) is 3 independent multi-trial runs on one developer machine, not a controlled multi-hardware study (see "Limitations" in the paper) — the macro speedup was noisy run-to-run (1.01x–1.37x); the consistent, defensible finding is reduced latency *variance*, not a fixed multiplier. Re-run `apps/api/src/scripts/benchmarkClassifier.ts` yourself (see Appendix A) before citing a specific number.
4. Fill in your own name/affiliation/course details at the top.
