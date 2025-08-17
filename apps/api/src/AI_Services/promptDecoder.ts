// apps/api/src/AI_Services/promptDecoder.ts
import { ChatGroq } from "@langchain/groq";
import * as dotenv from 'dotenv';
dotenv.config();

interface GmailParams {
  maxResults: number;
  dateQuery?: string;
  searchQuery?: string;
}

interface AIFilterRules {
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  keywords?: string[];
  complexity?: string;
  requiresSemanticAnalysis: boolean;
}

interface DecodedPrompt {
  gmailParams: GmailParams;
  aiFilterRules: AIFilterRules | null;
}

// Step 1: Gmail Query Builder Template
const GMAIL_QUERY_TEMPLATE = `
CRITICAL: Respond with ONLY valid JSON. No explanations, no text, no markdown.

Current date: {today}
Convert this user request to Gmail search parameters.

Examples:
Request: "emails from today" 
→ {"maxResults": 20, "dateQuery": "after:{today} before:{today}", "searchQuery": ""}

Request: "emails from john@company.com last week" 
→ {"maxResults": 10, "dateQuery": "after:2025/08/09 before:{today}", "searchQuery": ""}

Request: "urgent emails" 
→ {"maxResults": 50, "dateQuery": "", "searchQuery": ""}

Request: "complaints about billing" 
→ {"maxResults": 50, "dateQuery": "", "searchQuery": ""}

Rules:
- Only include in JSON:
  - **after:/before:** for time ranges
  - **maxResults**: 
    - 10–20 for narrow queries
    - 50 for vague/broad queries
- Synonyms, vague keywords, or semantic intent are handled in a second AI filtering step
- Always produce valid JSON
- searchQuery is always empty, so leave like "searchQuery": ""

User Request: "{userPrompt}"

JSON:
`;


// Step 2: AI Filter Rules Template
const AI_FILTER_TEMPLATE = `
CRITICAL: Respond with ONLY valid JSON. No explanations, no text, no markdown.

Analyze if this request needs AI content filtering after Gmail search.

Examples:
"unhappy customers" 
→ {"sentiment": "negative", "keywords": ["unhappy"], "complexity": "negative sentiment analysis", "requiresSemanticAnalysis": true}

"emails from john@company.com" 
→ {"sentiment": null, "keywords": [], "complexity": null, "requiresSemanticAnalysis": false}

"praising our feature" 
→ {"sentiment": "positive", "keywords": ["praising"], "complexity": "positive sentiment analysis", "requiresSemanticAnalysis": true}

"unknown or vague request" 
→ {"sentiment": null, "keywords": [], "complexity": "Fallback: full AI analysis needed", "requiresSemanticAnalysis": true}

"emails about expense list" 
→ {"sentiment": null, "keywords": ["expense", "list"], "complexity": "topic-based filtering", "requiresSemanticAnalysis": true}

Rules:
- Always produce valid JSON
- If request is vague, emotional, or semantic in nature → set "requiresSemanticAnalysis": true
- Extract topic keywords (like "billing", "refunds", "expense list") even if sentiment is null
- Expand synonyms if possible (e.g., "refunds" → ["refunds","reimbursements"])
- sentiment = positive/negative/neutral only if clearly implied
- complexity = short description of what kind of AI filter step is required
- If it's just a plain request with no semantic load → requiresSemanticAnalysis: false

User Request: "{userPrompt}"

JSON:
`;

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanSearchQuery(query: string): string {
  if (!query) return "";

  const trimmed = query.trim();

  // 1. Strip dangling operators like "from:" or "subject:"
  if (/^(from:|to:|subject:)\s*$/i.test(trimmed)) {
    return "";
  }

  // 2. Catch vague sender terms like "clients", "users", "customers"
  if (/^from:(clients|users|customers|people)$/i.test(trimmed)) {
    return "";
  }

  // 3. If query starts with from:, validate the *first token* only
  if (/^from:/i.test(trimmed)) {
    const [firstPart, ...rest] = trimmed.split(/\s+/); // split into tokens
    const emailCandidate = firstPart.split(":")[1];

    if (emailCandidate && !isLikelyEmail(emailCandidate)) {
      return "";
    }

    // Rebuild full query safely
    return [firstPart, ...rest].join(" ");
  }

  return trimmed;
}

function sanityFix(query: string, decoded: { gmailParams: GmailParams }): { gmailParams: GmailParams } {
  const hasEmail = query.includes("@");
  
  if (hasEmail) {
    // Extract the email
    const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : null;

    // Look for keyword after email (like "refund", "invoices", "bugs")
    const afterEmail = email ? (query.split(email)[1] || "") : "";
    const keywordMatch = afterEmail.match(/\b\w+\b/gi); // crude, but works for MVP
    const keywords = keywordMatch ? keywordMatch.filter(k => k.length > 3) : [];

    if (email) {
      decoded.gmailParams.searchQuery = `from:${email}`;
    }
  }

  return decoded;
}


export class ImprovedPromptDecoder {
  private llm: ChatGroq;
  private today: string;

  constructor() {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "your-api-key-here",
      model: "llama-3.1-8b-instant", // Smaller model is less chatty, better for structured output
      temperature: 0,
      maxTokens: 200 // Force shorter responses
    });

    // Simple today date formatting (like your original)
    const now = new Date();
    this.today = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
  }

  private async callLLM(prompt: string): Promise<any> {
    let cleanResponse = "";
    try {
      const response = await this.llm.invoke(prompt);
      cleanResponse = (response.content as string).trim();
      
      // More aggressive cleaning for stubborn models
      cleanResponse = cleanResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^JSON:\s*/i, '')
        .replace(/^Here.*?:/i, '')
        .replace(/^The.*?:/i, '')
        .trim();
      
      // Find JSON object in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      // Try to fix common JSON issues
      cleanResponse = this.repairJSON(cleanResponse);
      
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('LLM call failed:', error);
      console.error('Raw response trying to parse:', cleanResponse);
      throw error;
    }
  }

  private repairJSON(jsonString: string): string {
    try {
      // First, try parsing as-is
      JSON.parse(jsonString);
      return jsonString;
    } catch (e) {
      console.log('Attempting to repair malformed JSON...');
      let fixed = jsonString;
      
      // Fix 1: Missing colons after property names
      fixed = fixed.replace(/"([^"]+)""\s*,/g, '"$1": "",');
      fixed = fixed.replace(/"([^"]+)""\s*$/g, '"$1": ""');
      
      // Fix 2: Runaway search queries (truncate at reasonable length)
      const searchQueryMatch = fixed.match(/"searchQuery":\s*"([^"]*)/);
      if (searchQueryMatch && searchQueryMatch[1].length > 200) {
        const truncated = searchQueryMatch[1].substring(0, 100);
        fixed = fixed.replace(/"searchQuery":\s*"[^"]*[^"}]*/, `"searchQuery": "${truncated}"`);
      }
      
      // Fix 3: Remove broken/incomplete properties at the end
      fixed = fixed.replace(/,\s*-[^}]*$/, '');
      fixed = fixed.replace(/,\s*"[^":]*$/, '');
      
      // Fix 4: Ensure proper closing braces
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        fixed += '}';
      }
      
      // Fix 5: Clean up any trailing commas before closing braces
      fixed = fixed.replace(/,(\s*})/g, '$1');
      
      console.log('Repaired JSON:', fixed);
      return fixed;
    }
  }

  async decode(userPrompt: string): Promise<DecodedPrompt> {
    // Handle empty prompts
    if (!userPrompt?.trim()) {
      return {
        gmailParams: { maxResults: 10 },
        aiFilterRules: null
      };
    }

    try {
      // Step 1: Build Gmail query parameters (simple date replacement like your original)
      const gmailPrompt = GMAIL_QUERY_TEMPLATE
        .replace("{userPrompt}", userPrompt)
        .replace(/\{today\}/g, this.today);
      
      let gmailParams = await this.callLLM(gmailPrompt);

       // ✅ Apply sanity fix here
      gmailParams = sanityFix(userPrompt, { gmailParams }).gmailParams;

      // Step 2: Determine AI filtering needs
      const aiPrompt = AI_FILTER_TEMPLATE.replace("{userPrompt}", userPrompt);
      const aiRules = await this.callLLM(aiPrompt);


      // Combine results
      return {
        gmailParams: {
          maxResults: gmailParams.maxResults || 10,
          dateQuery: gmailParams.dateQuery || "",
          searchQuery: cleanSearchQuery(gmailParams.searchQuery || "")
        },
        aiFilterRules: aiRules.requiresSemanticAnalysis ? aiRules : null
      };

    } catch (error) {
      console.error('Prompt decoding failed:', error);
      
      // Intelligent fallback based on prompt content
      const fallbackMaxResults = this.determineFallbackMaxResults(userPrompt);
      
      return {
        gmailParams: { maxResults: fallbackMaxResults },
        aiFilterRules: {
          sentiment: undefined,
          keywords: [userPrompt.trim()],
          complexity: "Fallback: full AI analysis needed",
          requiresSemanticAnalysis: true
        }
      };
    }
  }

  private determineFallbackMaxResults(prompt: string): number {
    const lowerPrompt = prompt.toLowerCase();
    
    // Specific queries - fewer results
    if (lowerPrompt.includes('@') || lowerPrompt.includes('from:')) return 10;
    if (lowerPrompt.includes('today') || lowerPrompt.includes('yesterday')) return 20;
    
    // Broad queries - more results
    if (lowerPrompt.includes('all') || lowerPrompt.includes('everything')) return 100;
    if (lowerPrompt.includes('month') || lowerPrompt.includes('week')) return 50;
    
    // Default
    return 25;
  }
}

// Usage example and testing
export async function testImprovedDecoder() {
  const decoder = new ImprovedPromptDecoder();
  
  const testCases = [
    "find emails reporting payment issues in last 3 days",
    "show me emails with delivery complaints from last month", 
    "list emails where users are unhappy with the support team",
    "show me all emails from user@example.com in the last 2 days",
    "find emails expressing dissatisfaction without specific details"
  ];

  console.log('🚀 Testing Improved Prompt Decoder...\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`📝 User Prompt: "${testCase}"`);
      const result = await decoder.decode(testCase);
      console.log('Result:', JSON.stringify(result, null, 2));
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Failed for: "${testCase}"`, error);
    }
  }
}