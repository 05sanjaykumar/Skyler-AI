// apps/web/src/components/main/PromptSection.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function PromptSection({ instance }: { instance: any }) {
  const [promptName, setPromptName] = useState(instance.promptName || "");
  const [saving, setSaving] = useState(false);
  const { data: session } = useSession();

  async function savePrompt() {
    if (!session?.appToken) return;
    setSaving(true);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/prompts/${instance.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.appToken}`,
      },
      body: JSON.stringify({ promptName }),
    });
    setSaving(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Prompt</h2>
      <input
        type="text"
        value={promptName}
        onChange={(e) => setPromptName(e.target.value)}
        className="border p-2 rounded w-full mb-2"
        placeholder="Set prompt name"
      />
      <button
        onClick={savePrompt}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Prompt"}
      </button>
    </div>
  );
}
