// apps/web/src/components/main/PromptSection.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, RefreshCw, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PromptSection({ instance, onGenerate }: { instance: any, onGenerate: () => void}) {
  const [promptName, setPromptName] = useState(instance.promptName || "");
  const [saving, setSaving] = useState(false);
  const [decoded, setDecoded] = useState<any>(instance.promptDecode || null);
  const [copied, setCopied] = useState(false);
  const [showDecoded, setShowDecoded] = useState(!!instance.promptDecode);
  const { data: session } = useSession();

  async function copyToClipboard() {
    if (!decoded) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(decoded, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }

  async function saveAndDecodePrompt() {
    if (!session?.appToken) return;

    setSaving(true);

    try {

      // 2️⃣ Decode the prompt
      const decodeRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/prompt/${instance.id}`,
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
      setShowDecoded(true);
      setDecoded(decodedResult);

    } catch (error) {
      console.error("Error saving or decoding prompt:", error);
    } finally {
      setSaving(false);
    }
  }

  async function Refresh() {
    if (!session?.appToken) return;

    try {
      await onGenerate();
    } catch (error) {
      console.error("Error on Refresh or Fetching:", error);
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
            onClick={Refresh}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      <AnimatePresence>
        {decoded && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mt-4 border rounded bg-background overflow-hidden"
          >
            <motion.div
              whileHover={{ backgroundColor: "rgb(243 244 246)" }}
              onClick={() => setShowDecoded((prev) => !prev)}
              className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 rounded-t transition-colors duration-200"
            >
              <span className="font-semibold text-black">AI's Understanding</span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard();
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </motion.button>
                <motion.div
                  animate={{ rotate: showDecoded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-5 h-5 text-black" />
                </motion.div>
              </div>
            </motion.div>

            <AnimatePresence>
              {showDecoded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="p-3"
                  >
                    <motion.pre
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="text-sm whitespace-pre-wrap"
                    >
                      {JSON.stringify(decoded, null, 2)}
                    </motion.pre>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}