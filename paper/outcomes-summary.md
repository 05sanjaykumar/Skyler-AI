# Skyler AI vs. Existing Conference Papers — Gaps and Outcomes

## The papers

| | Abdelhady & Shaker (2025, IEEE ACDSA) | La Min Ei & Yongsiriwit (2025, IEEE InCIT) |
|---|---|---|
| Model | BERT + RoBERTa + DistilBERT ensemble | Llama 3.2, few-shot |
| Task | Spam classification | Phishing classification |
| Reported metrics | **98.46% accuracy, 98.47% F1**, 32.82 sec to train | Classification performance on a labeled set (results section paywalled; title/venue/approach verified) |
| What they measure | Classification quality, offline, once, on a static test set | Same |
| What they don't measure | Anything about request-time serving behavior, or whether a multi-signal decision (not just one label) is correct | Same |

## The gap

Both papers validate *which model to pick*. Neither measures *what happens once that model is actually deployed and serving requests* — model loading cost, batching behavior, latency variance — or *whether a real product decision built on top of the model is correct*, since both papers evaluate one classifier against one label, not a combined rule.

## Skyler AI's outcome, measured against that same gap

| Axis | What the papers report | Skyler AI, measured |
|---|---|---|
| Classification quality | 98.46% accuracy / 98.47% F1 (spam task, ensemble model) | **89.91% accuracy / 90.27% F1** on the real, official SST-2 benchmark — different task (sentiment, not spam), stated plainly, not claimed equivalent |
| Request-time serving cost | Not measured by either paper | **252–310 ms per request** of pure model-reload overhead identified and eliminated; live `classifyMs` telemetry on the real endpoint |
| Per-email classification cost | Not measured by either paper (no LLM-per-email cost reported for comparison) | **~22–26 ms/email** at realistic 200-email scale, with no LLM call per email |
| End-to-end filtering-decision accuracy (sentiment AND keyword/semantic match combined — not just one label) | Not measured by either paper | **94.4% accuracy, 100% precision, 83.3% recall, 90.9% F1** — measured on a labeled 90-email test set against the real, deployed system |
| Latency predictability under real load | Not measured by either paper | **1.2x–8.2x** reduction in latency variance; worst-case spikes bounded from 11–14 sec down to ~8 sec |

## Bottom line

On the one axis that's directly comparable — single-model classification accuracy — Skyler AI does not beat the IEEE baseline (89.91% vs. 98.46%, and it is a different task). That is stated plainly, not hidden. On every other axis — request-time serving cost, per-email cost, end-to-end filtering-decision accuracy, latency predictability — **neither paper reports a number at all**, because neither paper measures that axis. Skyler AI does, with real measurements against a real, deployed system. That is the gap, and that is the outcome: not a bigger accuracy number on the same question they already answered, but answers to the questions they never asked.
