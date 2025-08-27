import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
dotenv.config();

interface SummariserResult {
  summary: string;
  bestRule: { id: string; text: string };
  draft: string;
  scores?: { rule: { id: string; text: string }; score: number }[];
}

interface Rule {
  id: string;
  text: string;
}

export class GmailSummariser {
  private llm: ChatGroq;

  constructor() {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "your-api-key-here",
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      maxTokens: 300
    });
  }

  private async callLLM(prompt: string): Promise<string> {
    const response = await this.llm.invoke(prompt);
    return (response.content as string).trim();
  }

  /**
   * Summarise email + draft reply using rules
   */
  public async summariseEmail(
    emailBody: string,
    rules: Rule[]
  ): Promise<SummariserResult> {
    if (!rules.length) {
      throw new Error("No rules provided for summarisation.");
    }

    // Build structured prompt for Groq
    const prompt = `
You are a professional customer support assistant.
Summarise the email below in one concise sentence.
Then, choose the most relevant rule from the given list of rules.
Finally, draft a professional, polite, and friendly reply to the email using that rule.

Email:
"""${emailBody}"""

Rules:
${rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}

Requirements:
- Summarise the email in 1 sentence
- Select only one rule from the list that matches the email
- Draft a reply in 2-3 sentences maximum
- Friendly, professional, polite tone
- Do NOT add greetings, signatures, or unrelated commentary
- Respond ONLY with valid JSON in the following format:

{
  "summary": "<one sentence summarising email>",
  "bestRule": {
    "id": "<rule id>",
    "text": "<rule text>"
  },
  "draft": "<draft reply text>"
}
`;

    // Call LLM
    const rawOutput = await this.callLLM(prompt);

    // Extract JSON from output
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to extract JSON from LLM output.");

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as SummariserResult;
    } catch (err) {
      console.error("Error parsing JSON from summariser:", rawOutput);
      throw err;
    }
  }
}
