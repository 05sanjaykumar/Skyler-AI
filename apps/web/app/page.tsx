import type { Metadata } from "next";

export const metadata:Metadata = {
  title: "Skyler – AI Inbox Organizer",
  description: "Smart, prompt-based inbox & task manager for teams.",
};


export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">Skyler AI</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Organize and reply to messages using prompt-based workflows.
      </p>
      <div className="flex gap-4">
        <a href="/login" className="px-4 py-2 bg-black text-white rounded-lg">
          Login
        </a>
        <a href="/signup" className="px-4 py-2 border border-black text-black rounded-lg">
          Sign Up
        </a>
      </div>
    </main>
  );
}
