// apps/api/src/lib/groqAI.ts
import axios from "axios";

export async function groqAIProcess(promptName: string, messages: any[]) {
  // Create a text block from emails for AI
  const inputText = messages
    .map(m => `From: ${m.from}\nSubject: ${m.subject}\nSnippet: ${m.snippet}`)
    .join("\n\n");

  const response = await axios.post(
    "https://api.groq.com/v1/chat/completions",
    {
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an assistant that classifies and summarizes emails according to the prompt: ${promptName}`
        },
        { role: "user", content: inputText }
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  // Return processed AI output (customize format if needed)
  return response.data.choices[0].message.content;
}
