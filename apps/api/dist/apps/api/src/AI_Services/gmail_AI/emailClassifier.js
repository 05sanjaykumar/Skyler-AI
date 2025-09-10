"use strict";
// apps/api/src/AI_Services/emailClassifier.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailClassifier = void 0;
const transformers_1 = require("@xenova/transformers");
// --- Utils -------------------------------------------------------
function as2D(t) {
    // Handles Tensor, 3D, 2D, 1D
    if (t && typeof t === "object" && "dims" in t && "tolist" in t) {
        const dims = t.dims;
        const arr = t.tolist();
        if (dims.length === 3)
            return arr[0];
        if (dims.length === 2)
            return arr;
        if (dims.length === 1)
            return [arr];
        // Fallback: flatten
        return [Array.from(t.data)];
    }
    if (Array.isArray(t)) {
        if (Array.isArray(t[0])) {
            // 3D?
            if (Array.isArray(t[0][0]))
                return t[0];
            // 2D
            return t;
        }
        else {
            // 1D
            return [t];
        }
    }
    throw new Error("Unexpected embedding output");
}
function meanPool(tokens) {
    const seq = tokens.length;
    const hidden = tokens[0].length;
    const out = new Array(hidden).fill(0);
    for (let i = 0; i < seq; i++) {
        const row = tokens[i];
        for (let j = 0; j < hidden; j++)
            out[j] += row[j];
    }
    for (let j = 0; j < out.length; j++)
        out[j] /= Math.max(1, seq);
    return out;
}
function clsPool(tokens) {
    return tokens[0];
}
function l2(vec) {
    let s = 0;
    for (let i = 0; i < vec.length; i++)
        s += vec[i] * vec[i];
    return Math.sqrt(s);
}
function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        const av = a[i], bv = b[i];
        dot += av * bv;
        na += av * av;
        nb += bv * bv;
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-12;
    return dot / denom;
}
// --- Classifier --------------------------------------------------
class EmailClassifier {
    constructor() {
        this.DEBUG = false; // flip to true for console traces
    }
    async init() {
        this.sentimentAnalyzer = await (0, transformers_1.pipeline)("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
        this.embedder = await (0, transformers_1.pipeline)("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    async getVector(text) {
        const t = (await this.embedder(text));
        // Optional peek
        if (this.DEBUG && t.dims) {
            console.log("embed dims:", t.dims);
        }
        let tokens = as2D(t);
        let v = meanPool(tokens);
        // guard: if zero/NaN, try CLS
        const norm = l2(v);
        if (!isFinite(norm) || norm < 1e-8) {
            v = clsPool(tokens);
        }
        return v;
    }
    async analyzeSentiment(text) {
        const res = await this.sentimentAnalyzer(text);
        return res[0].label.toLowerCase(); // 'positive'|'negative'
    }
    keywordMatch(email, keywords) {
        const text = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw.toLowerCase()));
    }
    async semanticAnyMatch(emailText, keywordVectors, threshold) {
        // Split text into sentences
        const sentences = emailText.split(/[.?!\n]/).map(s => s.trim()).filter(Boolean);
        for (const sentence of sentences) {
            const sentenceVec = await this.getVector(sentence);
            for (let i = 0; i < keywordVectors.length; i++) {
                const sim = cosine(sentenceVec, keywordVectors[i]);
                if (isFinite(sim) && sim >= threshold) {
                    return true; // match found
                }
            }
        }
        return false;
    }
    async filterEmails(emails, rules) {
        const keywords = rules.keywords?.filter(Boolean) ?? [];
        const threshold = typeof rules.similarityThreshold === "number" ? rules.similarityThreshold : 0.6;
        // Precompute keyword vectors once
        let keywordVectors = [];
        if (rules.requiresSemanticAnalysis && keywords.length > 0) {
            keywordVectors = await Promise.all(keywords.map((kw) => this.getVector(kw)));
        }
        const tasks = emails.map(async (email) => {
            // SENTIMENT (optional)
            let sentimentOK = true;
            if (rules.sentiment) {
                const textToAnalyze = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
                const s = await this.analyzeSentiment(textToAnalyze);
                sentimentOK = s === rules.sentiment.toLowerCase();
            }
            // CONTENT MATCH
            const literalOK = keywords.length ? this.keywordMatch(email, keywords) : true;
            let semanticOK = false;
            if (rules.requiresSemanticAnalysis && keywordVectors.length > 0) {
                const emailText = `${email.subject} ${email.snippet} ${email.aiContent || ""} ${email.body || ""}`;
                semanticOK = await this.semanticAnyMatch(emailText, keywordVectors, threshold);
            }
            // If semantic is enabled, use OR between literal and semantic.
            // If not enabled, rely on literal (or true if no keywords).
            const contentOK = rules.requiresSemanticAnalysis
                ? (literalOK || semanticOK)
                : literalOK;
            const keep = sentimentOK && contentOK;
            if (this.DEBUG) {
                console.log(`[${email.subject}] sentimentOK=${sentimentOK} literalOK=${literalOK} semanticOK=${semanticOK} => keep=${keep}`);
            }
            return keep ? email : null;
        });
        const results = await Promise.all(tasks);
        return results.filter(Boolean);
    }
}
exports.EmailClassifier = EmailClassifier;
