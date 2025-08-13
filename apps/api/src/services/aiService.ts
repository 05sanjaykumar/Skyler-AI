// apps/api/src/services/aiSercvices.ts

export async function classifyEmail(emailText: string, prompt: string) {
  // Calls Groq/OpenAI/LangChain
}

export async function categorizeEmail(emailText: string) {
  // Optional: assign labels like "bug report", "feature request"
}

export async function generateBatchReply(emails: string[], prompt: string) {
  // Creates a single draft reply for multiple emails
}
