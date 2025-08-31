"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";

const EmailRules = ({
  instanceId,
  token,
}: {
  instanceId: string;
  token: string;
}) => {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load ruleBox on mount
  useEffect(() => {
    const fetchRuleBox = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/rulebox/${instanceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setDraft(data.ruleBox || "");
        }
      } catch (err) {
        toast.error("Failed to fetch ruleBox");
      }
    };
    fetchRuleBox();
  }, [instanceId, token]);

  // Save ruleBox (overwrite)
  const handleSave = async () => {
    if (!draft.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/rulebox/${instanceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ ruleBox: draft }),
        }
      );
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000); // reset after 2s
      }
    } catch (err) {
        toast.error("Save error");
    } finally {
      setLoading(false);
    }
  };

  // Clear ruleBox
  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/rulebox/${instanceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      if (res.ok) {
        setDraft("");
      }
    } catch (err) {
      toast.error("Clear error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />
      <Textarea
        placeholder="Define your rules (plain text)."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="min-h-[150px]"
        maxLength={1000}
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          className={`${
            saved
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saved ? "Saved!" : "Save"}
        </Button>
        <Button
          variant="destructive"
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </Button>
      </div>

    </div>
  );
};

export default EmailRules;
