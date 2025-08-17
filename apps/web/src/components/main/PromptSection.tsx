// apps/web/src/components/main/PromptSection.tsx
"use client";

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";


export default function PromptSection({ instance }: { instance: any }) {
  const [promptName, setPromptName] = useState(instance.promptName || "");
  const [saving, setSaving] = useState(false);
  const [decoded, setDecoded] = useState<any>(null); // store decoded result
  const [showDecoded, setShowDecoded] = useState(false);
  const { data: session } = useSession();

  async function saveAndDecodePrompt() {
    if (!session?.appToken) return;

    setSaving(true);

    try {
      // 1️⃣ Save the prompt
      const saveRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/prompt/${instance.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.appToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ promptName }),
        }
      );
      const updated = await saveRes.json();

      // 2️⃣ Decode the prompt
      const decodeRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/prompt/${instance.id}/decode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.appToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ prompt: promptName }),
        }
      );

      const decodedResult = await decodeRes.json();
      setShowDecoded(true); // auto-open after generating
      setDecoded(decodedResult); // store the structured result for UI

    } catch (error) {
      console.error("Error saving or decoding prompt:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
     <div className="space-y-3">
      <h2 className="text-xl font-semibold">Prompt</h2>
      <textarea
        value={promptName}
        onChange={(e) => setPromptName(e.target.value)}
        className="border p-2 rounded w-full bg-background"
        placeholder="Set prompt name"
      />
      <div className="flex gap-2">
        <button
          onClick={saveAndDecodePrompt}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Generate"}
        </button>

        {decoded && (
          <button
            onClick={saveAndDecodePrompt}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      {decoded && (
        <div className="mt-4 border rounded bg-background">
          <button
            onClick={() => setShowDecoded((prev) => !prev)}
            className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-t"
          >
            <span className="font-semibold">Decoded Result</span>
            {showDecoded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {showDecoded && (
            <div className="p-3">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(decoded, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
