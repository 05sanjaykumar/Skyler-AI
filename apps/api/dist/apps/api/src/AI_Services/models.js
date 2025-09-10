"use strict";
// models.ts
// Fix "ReferenceError: self is not defined" bug when running directly with node
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedder = exports.sentimentAnalyzer = void 0;
exports.loadModels = loadModels;
const transformers_1 = require("@xenova/transformers");
// export let summarizer: any;
async function loadModels() {
    if (exports.sentimentAnalyzer && exports.embedder)
        return;
    exports.sentimentAnalyzer = await (0, transformers_1.pipeline)("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
    exports.embedder = await (0, transformers_1.pipeline)("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    // summarizer = await pipeline("text2text-generation", "Xenova/flan-t5-base");
}
