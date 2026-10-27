TITLE: Reducing Inference Latency and Improving Filtering Accuracy in Lightweight, Privacy-Preserving Email Triage: A Case Study on Skyler AI

AUTHOR: Sanjay Kumar

ABSTRACT: On-device, small-model Natural Language Processing (NLP) pipelines are increasingly used for privacy-preserving email classification as an alternative to routing message content through third-party cloud Large Language Models (LLMs). We take as a direct baseline three recent papers that evaluate this style of pipeline for email classification [1], [2], [9], and show that all three validate classification quality offline, on a single label, while making an implicit or explicit production/real-time suitability claim that none of them measures. We identify this as a concrete, three-part gap: none of the cited works measures (i) request-time model-serving cost, (ii) the accuracy of a combined, multi-signal filtering decision as opposed to one classifier's label, or (iii) data-locality/privacy guarantees, despite privacy being a stated motivation for preferring small local models over cloud LLMs. We close this gap in Skyler AI, a production Gmail triage application using local DistilBERT and MiniLM models. We identify and fix a model-reinitialization bug that wasted 252-310 ms on every classification request; we identify and fix a miscalibrated semantic-similarity threshold that was silently degrading a combined sentiment-and-content filtering rule to 60.5% F1; and we build and pass a network-level test proving zero data egress during classification. We report classification quality on the real, official SST-2 benchmark (89.91% accuracy, 90.27% F1) and filtering-decision accuracy on a labeled test set (94.4% accuracy, 90.9% F1), both measured against the real, deployed system, alongside an explainability mechanism absent from two of the three baselines.

INDEX TERMS: email classification, semantic search, on-device NLP, inference latency, privacy-preserving AI, explainable AI, similarity threshold calibration

SECTION: I. INTRODUCTION

Email remains the primary communication channel for most knowledge work, and inbox overload is a well-documented productivity problem. A growing category of tools addresses this by classifying, filtering, and drafting replies to email using a mix of lightweight local NLP models and cloud LLMs. Skyler AI is one such tool: it runs a local sentiment classifier and a local sentence embedder in-process, and calls a cloud LLM only for the smaller, user-initiated task of drafting a reply to an email the user has already chosen to act on. This is a privacy- and cost-motivated design choice, consistent with the design philosophy argued for in recent email-classification literature [1], [2], [7], [9].

This paper makes four contributions. First, we compare Skyler AI's design directly against three verifiable, recent papers in the same problem space and show precisely what none of them measures. Second, we identify and fix two concrete, previously unmeasured bugs in Skyler AI's own deployed code: a request-time model-reinitialization cost, and a miscalibrated semantic-similarity threshold that was silently reducing filtering recall by more than half. Third, we add explainability and a proven data-locality guarantee, both absent from the cited baselines. Fourth, we report all results honestly, including two optimizations that did not survive measurement and were not shipped.

SECTION: II. RELATED WORK AND RESEARCH GAP

SUBSECTION: A. Direct literature baseline

Table I summarizes three directly relevant papers. Abdelhady and Shaker [1] report a BERT/RoBERTa/DistilBERT ensemble achieving 98.46% accuracy and 98.47% F1 on spam classification, with a training time of 32.82 seconds, explicitly framed as enabling "a practical solution for real-time spam classification in production environments." La Min Ei and Yongsiriwit [2] propose few-shot phishing classification with a lightweight LLM (Llama 3.2) instead of a large proprietary model. Al-Subaiey et al. [9] report 0.99 F1 for an explainable phishing classifier with an unspecified XAI layer, deployed as a "real-time web-based" application.

TABLE I: Literature Baseline Summary
| Paper | Model | Task | Reported Metric | Production Claim |
|---|---|---|---|---|
| [1] Abdelhady and Shaker | BERT+RoBERTa+DistilBERT | Spam classification | 98.46% acc., 98.47% F1 | Real-time production use |
| [2] La Min Ei and Yongsiriwit | Llama 3.2, few-shot | Phishing classification | Not public (paywalled) | Lightweight-model framing |
| [9] Al-Subaiey et al. | Unspecified + XAI | Phishing classification | 0.99 F1 | Real-time web deployment |

SUBSECTION: B. Broader literature

Rojas-Galeano [3] compares Flan-T5 against GPT-4 for zero-shot spam classification, reporting a model-size/accuracy tradeoff (90% vs. 95% F1) without addressing request-time serving. Kamberi [4] pairs a MiniLM embedding model with keyword extraction for email routing, again evaluated offline. Distil Labs [7] offers a distilled local classifier explicitly for privacy, again evaluated only on offline accuracy. Kabakibo et al. [5] and Liu et al. [6] study cold-start latency, but at the scale of GPU-backed LLM-serving engines and distributed edge pipelines, not small in-process models embedded in ordinary application code. A broader literature on embedding-similarity calibration [10] independently confirms that fixed cosine-similarity thresholds do not transfer across models or domains and must be calibrated against labeled data — directly relevant to Section V-D.

SUBSECTION: C. The gap

Across all three baseline papers, a model is validated for classification accuracy, and a production-readiness or real-time claim is made on top of it, but none measures: (1) the cost of initializing and serving that model on a live, request-driven backend; (2) whether a combined, multi-signal product decision built on the model (not a single label) is correct; or (3) where user data goes during inference. This is the gap this paper addresses.

SECTION: III. SYSTEM OVERVIEW

Skyler AI is a Gmail triage and reply-assist tool. The backend (Express/TypeScript) runs two local models through an ONNX runtime: a DistilBERT sentiment classifier and a MiniLM sentence embedder, both executed in-process with no GPU. A cloud LLM (Groq Llama-3.1-8b-instant) is used only for drafting a reply to a single, user-selected email — never for the classification path evaluated in this paper. The relevant request path fetches up to 200 Gmail messages per user action and, if an AI filter rule is configured, classifies them using a rule combining sentiment, literal keyword matching, and semantic similarity.

SECTION: IV. METHODOLOGY

SUBSECTION: A. Warm model singleton

The deployed classifier re-initialized both ONNX models from scratch on every classification request, discarding them at the end of the request, despite an existing but unused process-wide singleton loader already present in the codebase. We replace per-request instantiation with the warm singleton, and warm it once at process startup.

SUBSECTION: B. Length-bucketed batching

Naive batching of embedding and sentiment-analysis calls (one call for an entire set of texts) was measured to erase the benefit of batching for embeddings and to regress sentiment-analysis latency by approximately 8% on realistic, variable-length email text, because padding every text to the batch's longest member costs more than batching saves. We instead sort texts by length and batch within small, length-similar buckets (size 16), measured as a consistent ~1.1-1.2x improvement over both sequential calls and naive full-batching.

SUBSECTION: C. Calibrated similarity threshold

The deployed default similarity threshold for the semantic-matching path was 0.6. We constructed a labeled test set (90 synthetic emails; ground truth assigned by construction across a sentiment-by-topic grid, not manual judgment) and measured the deployed system's filtering decision against it. At the shipped default, precision was 100% but recall was 43.3% (F1 60.5%), because genuinely on-topic paraphrases measured real cosine similarities of 0.25-0.54 against single-word rule keywords — almost all below the 0.6 cutoff. A threshold sweep identified 0.34-0.36 as a genuine local optimum (verified with a fine-grained sweep, not a single lucky value); we ship 0.35.

SUBSECTION: D. Explainability

We add a method returning, for every email, the reason behind its filtering decision (detected sentiment label, matched keyword if any, and semantic-match boolean), exposed on the live endpoint as an additive field alongside the existing response contract.

SUBSECTION: E. Data-locality verification

We instrument a test that patches every Node.js network entry point (HTTP, HTTPS, raw TCP, TLS, and the global fetch API) before loading the classification models, then executes a full model-load-and-classification cycle, asserting zero network calls.

SECTION: V. EVALUATION

SUBSECTION: A. Model-reinitialization cost

Isolated measurement on the project's cached model weights shows 252-310 ms of pure model-loading overhead eliminated per request by the warm singleton, reduced to approximately 0 ms after process warm-up.

SUBSECTION: B. Realistic-scale, end-to-end latency

A reproducible benchmark harness drives the actual production classifier against a faithful reconstruction of the pre-fix classifier, at the product's own stated scale (200 emails/request). Across three independent runs, mean speedup varied from 1.01x to 1.37x on a shared, non-dedicated machine, but latency variance was consistently reduced by 1.2x-8.2x, and worst-case latency spikes were bounded from 11-14 seconds down to approximately 8 seconds. We report the range transparently rather than a single favorable run.

SUBSECTION: C. Classification quality

Running the actual deployed sentiment model against the real, official SST-2 validation set (872 labeled examples) yields 89.91% accuracy and 90.27% F1 — a genuine measurement on a different task than the spam/phishing classification reported in [1], [2], [9], stated here explicitly rather than implied as equivalent.

SUBSECTION: D. End-to-end filtering-decision accuracy

Against the labeled 90-email test set described in Section IV-C, the calibrated system achieves 94.4% accuracy, 100% precision, 83.3% recall, and 90.9% F1 — a metric none of the three baseline papers reports, since each evaluates one classifier's label rather than a combined, rule-based decision. Per-error diagnosis attributes four of the five remaining errors to the sentiment sub-model's domain mismatch (trained on movie reviews; email administrative phrasing such as "still needs processing" independently scores as negative sentiment at high confidence), consistent with and explaining the 89.91% ceiling in Section V-C, rather than to any remaining calibration or batching defect.

SUBSECTION: E. Privacy verification

The network-interception test described in Section IV-E passes with zero recorded calls across model loading, sentiment analysis, and semantic embedding, providing a proof rather than an assertion of the data-locality claim motivating this and related work [7].

TABLE II: Skyler AI vs. the Literature Baseline
| Axis | Baseline ([1],[2],[9]) | Skyler AI (measured) |
|---|---|---|
| Classification quality | 98.46%/98.47% F1; 0.99 F1 | 89.91% acc./90.27% F1 (different task) |
| Request-time serving cost | Not measured | 252-310 ms/request eliminated |
| Combined filtering-decision accuracy | Not measured | 94.4% acc., 90.9% F1 |
| Explainability (multi-signal) | [9] explains one label only | Full reason per email, live |
| Data locality / privacy | Not measured or proven | Proven: 0 network calls |
| Latency predictability | Not measured | 1.2x-8.2x variance reduction |

SECTION: VI. DISCUSSION AND LIMITATIONS

The filtering-accuracy test set is self-constructed, since no public labeled "should this rule keep this email" dataset exists; validation against real, held-out email traffic is future work. The realistic-scale latency benchmark was run on one shared, non-dedicated machine; a multi-machine study would narrow the reported range. The sentiment-model domain-mismatch finding (Section V-D) is diagnosed but deliberately not patched with an unvalidated heuristic, to avoid overfitting a fix to our own five-example error set. Live production `classifyMs` telemetry exists in the shipped code but has not yet been collected against real Gmail traffic, since this evaluation environment has no access to a live account or production database.

SECTION: VII. CONCLUSION AND FUTURE WORK

We identified a three-part gap in recent email-classification literature — serving-time cost, combined-decision accuracy, and data-locality guarantees — none of which is measured by three directly comparable papers despite each making an implicit or explicit production-readiness claim. We closed this gap in a real, deployed system: fixing a 252-310 ms per-request latency bug, fixing a similarity-threshold calibration bug that had cut filtering recall by more than half (43.3% to 83.3% recall after calibration), adding explainability for a combined decision, and proving — not asserting — a zero-data-egress privacy guarantee. Future work includes a held-out, real-email-traffic validation of the filtering-accuracy benchmark, a multi-machine latency study, and investigation of sentence-weighted sentiment scoring to address the diagnosed domain-mismatch ceiling, validated on data independent of this paper's own test construction.

REFERENCES:
[1] A. S. Abdelhady and M. A. Shaker, "Comprehensive Email Spam Detection Using Large Language Models: Exploring the Limits of LLM-Based and Traditional Methods," in Proc. 2025 Int. Conf. Artificial Intelligence, Computer, Data Sciences and Applications (ACDSA), IEEE, 2025.
[2] La Min Ei and K. Yongsiriwit, "Phishing Email Classification Using Few-Shot Learning with a Lightweight LLM (Llama 3.2)," in Proc. 2025 9th Int. Conf. Information Technology (InCIT), IEEE, 2025.
[3] S. Rojas-Galeano, "Zero-Shot Spam Email Classification Using Pre-trained Large Language Models," in Applied Computer Sciences in Engineering (WEA 2024), Communications in Computer and Information Science, vol. 2222, Springer, 2024. arXiv:2405.15936.
[4] H. Kamberi, "Intelligent Email Routing with LLMs," M.Sc. thesis, South East European Univ., Tetovo, North Macedonia, 2026.
[5] H. S. Kabakibo, A. Trivedi, and L. Wang, "Breaking the Ice: Analyzing Cold Start Latency in vLLM," arXiv:2606.07362, 2026.
[6] X. Liu, N. Xue, R. Bao, Y. Sun, Z. Chen, M. Tao, X. Xu, and S. Cui, "CSGO: Generalized Optimization for Cold Start in Wireless Collaborative Edge LLM Systems," arXiv:2508.11287, 2025.
[7] Distil Labs, "distil-email-classifier" (model card), accessed via featherless.ai, 2025.
[8] Xenova / Hugging Face, "distilbert-base-uncased-finetuned-sst-2-english" and "all-MiniLM-L6-v2" (ONNX model ports).
[9] A. Al-Subaiey, M. Al-Thani, N. A. Alam, K. F. Antora, A. Khandakar, and S. A. U. Zaman, "Novel Interpretable and Robust Web-based AI Platform for Phishing Email Detection," arXiv:2405.11619, 2024.
[10] S. Anand, "Embeddings similarity threshold," s-anand.net blog, 2024 (and related calibration literature discussed in Section II-B).
