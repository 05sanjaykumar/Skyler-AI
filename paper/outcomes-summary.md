# Skyler AI — Outcomes vs. Existing Research

Skyler AI classifies and filters email locally (DistilBERT + MiniLM) instead of sending every message to a cloud LLM. Two real 2025 IEEE papers cover the same kind of model for email classification, but neither measures what happens once that model is running inside a live backend taking real requests. That's the gap this project closes.

## Comparison

| | Existing research (literature) | Skyler AI (this project) |
|---|---|---|
| Abdelhady & Shaker (2025, IEEE ACDSA) | BERT+RoBERTa+DistilBERT ensemble: 98.46% accuracy, 98.47% F1, **32.82 sec to train** | — |
| La Min Ei & Yongsiriwit (2025, IEEE InCIT) | Llama 3.2 few-shot phishing classifier (lightweight-model approach) | — |
| What they measure | Classification quality, offline, once, on a static test set | — |
| What they don't measure | Nothing in either paper covers what happens when the model is loaded inside a request handler, serving real traffic | **This is what we measured and fixed** |

## Outcomes

1. **Found the real bug**: `EmailClassifier` was reloading both ONNX models from scratch on *every* `/gmail/pull` request — not just the first one. Confirmed, reproducible cost: **252–310 ms wasted per request**.
2. **Fixed it**: warm, process-wide model singleton. That cost is now ~0 ms after the first request.
3. **Shipped live telemetry**: `classifyMs` is now returned on the real endpoint, so the fix is checkable on real traffic, not just in a benchmark script.
4. **Measured real-world effect at scale** (200 emails/request, 3 independent runs): speedup was noisy (1.01x–1.37x, depending on machine load), but latency **variance dropped 1.2x–8.2x** and worst-case latency spikes (11–14 sec) were bounded down to ~8 sec. The honest takeaway: more predictable, fewer severe slowdowns — not a flat multiplier.
5. **Tried two more optimizations and reported both honestly**: batching embedding calls only helps on uniform-length text (real email text is a wash, 0.97x); batching sentiment calls was tested and found to be a consistent **8% regression** — reverted from production rather than kept for a better-looking number.
6. **Filled the one real blank**: ran Skyler AI's actual sentiment model against the real, official SST-2 benchmark (872 labeled examples) — **89.91% accuracy, 90.27% F1**. Not the same task as the IEEE papers' spam/phishing numbers (stated plainly), but a real, measured number instead of nothing.

## Bottom line

Existing research validates *which small model to use*. Nobody measures *what happens to that model once it's deployed*. Skyler AI had a real, costly bug on exactly that axis — fixed, measured, and verified, with the negative results reported alongside the positive ones.
