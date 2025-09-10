"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailSummariser = void 0;
const groq_1 = require("@langchain/groq");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class GmailSummariser {
    constructor() {
        this.llm = new groq_1.ChatGroq({
            apiKey: process.env.GROQ_API_KEY || "your-api-key-here",
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            maxTokens: 300
        });
    }
    async callLLM(prompt) {
        const response = await this.llm.invoke(prompt);
        return response.content.trim();
    }
    /**
     * Summarise email + draft reply using rules
     */
    async summariseEmail(emailBody, emailFrom, rules) {
        if (!rules.length) {
            throw new Error("No rules provided for summarisation.");
        }
        // Build structured prompt for Groq
        const prompt = `
You are a professional customer support assistant.
The email below is from: ${emailFrom}.
Use the sender information to tailor the response appropriately.

Task:
1. Summarise the email in ONE concise sentence.
2. Choose the most relevant rule from the given list of rules.
3. Draft a professional, polite, and friendly reply to the email using that rule.

Email:
"""${emailBody}"""

Rules:
${rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}

Requirements:
- Summarise the email in 1 sentence
- Select ONLY ONE rule from the list that is most relevant
- Draft the reply in 2–3 sentences maximum
- Friendly, professional, polite tone
- Do NOT add greetings, signatures, or unrelated commentary
- Respond ONLY in JSON in EXACTLY this format:

{
  "summary": "<one sentence summarising email>",
  "bestRule": {
    "id": "<rule id>",
    "text": "<rule text>"
  },
  "draft": "<draft reply text>"
}
- The JSON must be parseable. DO NOT include any extra text outside of JSON.
`;
        // Call LLM
        const rawOutput = await this.callLLM(prompt);
        // Extract JSON from output
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error("Failed to extract JSON from LLM output.");
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;
        }
        catch (err) {
            console.error("Error parsing JSON from summariser:", rawOutput);
            throw err;
        }
    }
}
exports.GmailSummariser = GmailSummariser;
