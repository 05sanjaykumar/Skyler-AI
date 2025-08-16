import { ChatGroq } from "@langchain/groq";
import * as dotenv from 'dotenv';
dotenv.config();

interface GmailParams {
  maxResults: number;
  dateQuery?: string;
  searchQuery?: string;
}

interface DecodedPrompt {
  gmailParams: GmailParams;
  aiFilterRules: string | null;
}

const PROMPT_DECODER_TEMPLATE = `
You are a Gmail API parameter extractor. Your task is to convert user requests into Gmail API parameters and any AI-specific filters.

Rules:
1. Always use the current date {today} for any relative date calculations.
2. Never output placeholders like YYYY/MM/DD.
3. Always hide your reasoning — do NOT include explanations or extra text in the output.
4. Normalize search terms (singular/plural) for better Gmail search matching.
5. Do not put vague terms or natural language phrases in 'searchQuery'; only valid Gmail search syntax.
6. Ambiguous words, sentiment, or semantic meaning must go in 'aiFilterRules'.
7. Only use 'from:' with exact emails, not general descriptors like 'customers'.
8. Return **strictly valid JSON** only, in this exact format:

GmailParams:
  - from: [optional, must be exact email]
  - subject: [optional keyword]
  - date: [optional, must be exact date if present]
  - searchQuery: [optional keywords, no special chars, strictly avoid emotions]
AIFilterRules:
  - semantic rules or sentiment, anything not strictly Gmail syntax

Return in this exact JSON format:
{
  "gmailParams": {
    "maxResults": <number>,
    "dateQuery": "<Gmail date format, e.g., after:YYYY/MM/DD before:YYYY/MM/DD>",
    "searchQuery": "<Gmail search terms if any>"
  },
  "aiFilterRules": "<description or null>"
}

- Automatically convert human date ranges to Gmail 'after:' / 'before:' format.
- If no parameters mentioned, use defaults: maxResults=10, dateQuery="", searchQuery="", aiFilterRules=null
- Return **only the JSON**
User Request: "{userPrompt}"
`;

const today = new Date();
const formattedToday = `${today.getFullYear()}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getDate().toString().padStart(2,'0')}`;



export class PromptDecoder {
  private llm: ChatGroq;

  constructor() {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "your-api-key-here",
      model: "openai/gpt-oss-20b",
      temperature: 0
    });
  }

  async decode(userPrompt: string): Promise<DecodedPrompt> {
    // Handle null/empty prompts
        if (!userPrompt || userPrompt.trim() === '') {
            return {
            gmailParams: { maxResults: 10 },
            aiFilterRules: null
            };
        }

        try {
            const prompt = PROMPT_DECODER_TEMPLATE.replace("{userPrompt}", userPrompt).replace("{today}", formattedToday);
            const response = await this.llm.invoke(prompt);
            
            // Clean the response - remove markdown code blocks
            let cleanResponse = response.content as string;
            
            // Remove ```json and ``` markers
            cleanResponse = cleanResponse
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();
            
            // Parse the cleaned JSON
            const parsed = JSON.parse(cleanResponse);
            return parsed;
            
        } catch (error) {
            console.error('Prompt decoding failed:', error);
            // Fallback for errors
            return {
            gmailParams: { maxResults: 20 },
            aiFilterRules: userPrompt
            };
        }
    }
}