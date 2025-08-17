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
Request: "emails from today" → {"maxResults": 20, "dateQuery": "after:{today} before:2025/08/17", "searchQuery": ""}
Request: "emails from john@company.com last week" → {"maxResults": 10, "dateQuery": "after:2025/08/09 before:{today}", "searchQuery": "from:john@company.com"}
Request: "urgent emails" → {"maxResults": 20, "dateQuery": "", "searchQuery": "urgent"}

Rules:
- Use Gmail operators: from:, subject:, after:, before: ONLY
- Dates in YYYY/MM/DD format
- maxResults: 10-20 for specific, 50-100 for broad queries
- Keep searchQuery short and simple
- In search query if contains emotions, feelings keep it empty, and 'from:' should be only in email format
- If request is vague or complex, use empty searchQuery: ""

User Request: "{userPrompt}"

JSON:`;

// Step 2: AI Filter Rules Template
const AI_FILTER_TEMPLATE = `
CRITICAL: Respond with ONLY valid JSON. No explanations, no text, no markdown.

Analyze if this request needs AI content filtering after Gmail search.

Examples:
"unhappy customers" → {"sentiment": "negative", "keywords": ["unhappy"], "complexity": "negative sentiment analysis", "requiresSemanticAnalysis": true}
"emails from john@company.com" → {"sentiment": null, "keywords": [], "complexity": null, "requiresSemanticAnalysis": false}
"praising our feature" → {"sentiment": "positive", "keywords": ["praising"], "complexity": "positive sentiment analysis", "requiresSemanticAnalysis": true}

User Request: "{userPrompt}"

JSON:`;

export class ImprovedPromptDecoder {
  private llm: ChatGroq;
  private today: string;

  constructor() {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "your-api-key-here",
      model: "llama3-8b-8192", // Smaller model is less chatty, better for structured output
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
      
      const gmailParams = await this.callLLM(gmailPrompt);

      // Step 2: Determine AI filtering needs
      const aiPrompt = AI_FILTER_TEMPLATE.replace("{userPrompt}", userPrompt);
      const aiRules = await this.callLLM(aiPrompt);

      // Combine results
      return {
        gmailParams: {
          maxResults: gmailParams.maxResults || 10,
          dateQuery: gmailParams.dateQuery || "",
          searchQuery: gmailParams.searchQuery || ""
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

  // Helper method to validate Gmail search query
  validateGmailQuery(searchQuery: string): boolean {
    // Check for common Gmail search operators
    const gmailOperators = /\b(from:|to:|subject:|has:|label:|is:|in:|after:|before:)/i;
    const hasBasicKeywords = searchQuery.trim().length > 0;
    const noInvalidChars = !/[<>{}[\]]/g.test(searchQuery);
    
    return hasBasicKeywords && noInvalidChars;
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