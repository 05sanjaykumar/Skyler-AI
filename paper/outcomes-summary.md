# Skyler AI vs. Existing Conference Papers — Gaps and Outcomes

## The papers

| | Abdelhady & Shaker (2025, IEEE ACDSA) | La Min Ei & Yongsiriwit (2025, IEEE InCIT) | Al-Subaiey et al. (2024, Computers & Electrical Engineering) |
|---|---|---|---|
| Model | BERT + RoBERTa + DistilBERT ensemble | Llama 3.2, few-shot | Unspecified classifier + XAI layer |
| Task | Spam classification | Phishing classification | Phishing classification, with explanations |
| Reported metrics | **98.46% accuracy, 98.47% F1**, 32.82 sec to train | Classification performance on a labeled set (paywalled results) | **0.99 F1**, claimed "real-time web-based" deployment |
| What they measure | Classification quality, offline, once | Same | Classification quality + explanation method (XAI "to enhance user trust"), for one label |
| What they don't measure | Request-time serving behavior; whether a multi-signal decision is correct; privacy guarantees | Same | Same — "real-time" is claimed, zero latency numbers given; explanations cover one label, not a combined rule; no privacy claim or verification |

All three make a production/real-time/trust claim (training speed, lightweight model choice, or "real-time web-based") without measuring the thing that claim depends on. None measures or proves a privacy guarantee.

## The gap

Across all three: a model is validated for accuracy, and a production-readiness claim is made on top of it — but none of the three measures serving-time cost, none measures whether a *combined, multi-signal* decision (not just one label) is correct, and none measures or proves anything about where user data goes during classification, despite privacy being a stated reason to prefer small local models over cloud LLMs in this space.

## Skyler AI's outcome, measured against that same gap

| Axis | What the papers report | Skyler AI, measured |
|---|---|---|
| Classification quality | 98.46% / 98.47% F1 (spam, ensemble); 0.99 F1 (phishing, unspecified model) | **89.91% accuracy / 90.27% F1** on the real, official SST-2 benchmark — different task (sentiment, not spam/phishing), stated plainly |
| Request-time serving cost | Not measured by any of the three | **252–310 ms per request** of model-reload overhead identified and eliminated; live `classifyMs` telemetry on the real endpoint |
| Per-email classification cost | Not measured by any of the three | **~22–26 ms/email** at realistic 200-email scale, no LLM call per email |
| End-to-end decision accuracy (sentiment AND keyword/semantic match combined) | Not measured by any of the three | **94.4% accuracy, 100% precision, 83.3% recall, 90.9% F1** — measured on a labeled 90-email test set against the real, deployed system |
| Explainability | Al-Subaiey et al. explain one label with an unspecified XAI method; the other two give none | **Every kept/discarded email now returns why**: sentiment label, matched keyword (if any), semantic-match flag — for the actual combined decision, live on the endpoint (`filterEmailsWithReasons`) |
| Privacy / data locality | Not measured or proven by any of the three, despite being a stated motivation for small local models over cloud LLMs | **Proven, not claimed**: a network-call interceptor patched into Node's http/https/net/tls/fetch before model load records zero network calls across model loading, sentiment analysis, and semantic embedding — verifiable by anyone who runs `verifyNoNetworkEgress.ts` |
| Latency predictability under real load | Not measured by any of the three | **1.2x–8.2x** reduction in latency variance; worst-case spikes bounded from 11–14 sec down to ~8 sec |

## Bottom line

On the one axis that's directly comparable — single-model classification accuracy — Skyler AI does not beat the best IEEE number (89.91% vs. 98.46%/0.99 F1), and it is a different task in each case. That is stated plainly. On every other axis — request-time serving cost, per-email cost, combined-decision accuracy, explainability of that combined decision, and privacy — **none of the three papers reports a number or a proof at all**. Skyler AI does, against a real, deployed system, with the method open for anyone to re-run.
