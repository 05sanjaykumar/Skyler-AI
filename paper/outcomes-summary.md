# Skyler AI vs. Existing Research — Gaps and Outcomes

## The papers

| | Mukherjee & Jiang (2019, arXiv) | Zhang et al. (2021, ACL — EmailSum) | Prexawanprasut (2025, Thailand Statistician) |
|---|---|---|---|
| Model | TF-IDF/GBDT + CNN-MLP ensemble, with user/email similarity features | T5 / BART abstractive summarization | BERT, DistilBERT, XLM-R |
| Task | Predict whether a user will act on (reply to) an incoming email | Abstractive summarization of email threads | Classify business email into 4 operational workflow categories |
| Reported metrics | **0.788 AUROC** (best ensemble) vs. 0.757 best baseline, on the public Avocado email dataset | No single trusted automatic metric — authors show ROUGE/BERTScore correlate weakly with human judgment on this task | **XLM-R > 92% accuracy** on 12,500 real business emails across 4 domains |
| What they measure | Offline triage-action ranking quality, on one fixed public dataset | Summary quality via human + automatic evaluation, fixed dataset | Offline classification accuracy, fixed labeled dataset |
| What they don't measure | Request-time serving cost; a *combined* multi-signal decision; privacy of the per-user email history used as model input | Whether the model is usable live inside a product that actually sends replies; serving cost; privacy | Request-time serving cost under load; a combined sentiment+keyword+semantic decision; per-decision explainability; privacy/data locality |

All three are freely downloadable (arXiv / ACL anthology / Thailand's open-access TCI-Thaijo platform) — no IEEE paywall or institutional login needed for any of them.

**Direct download links:**
- Mukherjee & Jiang (2019): https://arxiv.org/abs/1905.01991
- Zhang et al. (2021, EmailSum): https://arxiv.org/abs/2107.14691
- Prexawanprasut (2025): https://ph02.tci-thaijo.org/index.php/thaistat/article/view/266519/174074

## The gap

Each paper validates exactly one piece of what a real inbox-management product does — deciding what to do with an email, summarizing it, or classifying it — in isolation, offline, on a fixed dataset. None of the three measures serving-time cost on a live backend, whether a *combined* decision built from several signals together (not one model's output) is correct, or where user data goes during inference — despite data locality being a natural concern for any tool that reads a user's inbox.

## Skyler AI's outcome, measured against that same gap

| Axis | What the papers report | Skyler AI, measured |
|---|---|---|
| Classification quality | 0.788 AUROC (triage-action ranking); no single trusted metric (summarization); >92% accuracy (4-category workflow classification) | **89.91% accuracy / 90.27% F1** on the real, official SST-2 sentiment benchmark — a different task from all three, stated plainly, not claimed as a win |
| Request-time serving cost | Not measured by any of the three | **252–310 ms per request** of model-reload overhead identified and eliminated; live `classifyMs` telemetry on the real endpoint |
| Per-email classification cost | Not measured by any of the three | **~22–26 ms/email** at realistic 200-email scale, no LLM call per email |
| End-to-end decision accuracy (sentiment AND keyword/semantic match combined) | Not measured by any of the three | **94.4% accuracy, 100% precision, 83.3% recall, 90.9% F1** — measured on a labeled 90-email test set against the real, deployed system |
| Explainability | None of the three expose a reason for the combined decision a product would actually act on | **Every kept/discarded email now returns why**: sentiment label, matched keyword (if any), semantic-match flag — for the actual combined decision, live on the endpoint (`filterEmailsWithReasons`) |
| Privacy / data locality | Not measured or proven by any of the three | **Proven, not claimed**: a network-call interceptor patched into Node's http/https/net/tls/fetch before model load records zero network calls across model loading, sentiment analysis, and semantic embedding — verifiable by anyone who runs `verifyNoNetworkEgress.ts` |
| Latency predictability under real load | Not measured by any of the three | **1.2x–8.2x** reduction in latency variance; worst-case spikes bounded from 11–14 sec down to ~8 sec |

## Bottom line

Skyler AI is a multi-inbox organizer: it filters, prioritizes, and summarizes/drafts replies for Gmail using local models, not a spam or phishing filter. The closest literature match on raw classification accuracy — Prexawanprasut's 92%+ business-email workflow classifier — targets a different label (workflow category vs. keep/discard), so no single-number "we beat them" claim is made; that's stated plainly. On every other axis — request-time serving cost, per-email cost, combined-decision accuracy, explainability of that combined decision, and privacy — **none of the three papers reports a number or a proof at all**. Skyler AI does, against a real, deployed system, with the method open for anyone to re-run.
