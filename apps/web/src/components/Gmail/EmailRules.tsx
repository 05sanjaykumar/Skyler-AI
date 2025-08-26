// apps/web/src/components/main/EmailRules.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Rule {
  id: string;
  text: string;
}

const EmailRules = ({ instanceId, token }: { instanceId: string; token: string }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [draft, setDraft] = useState("");

  // Load rules on mount
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/rules/${instanceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setRules(data.rules || []);
        }
      } catch (err) {
        console.error("Failed to fetch rules", err);
      }
    };
    fetchRules();
  }, [instanceId, token]);

  // Save rule
  const handleSave = async () => {
    if (!draft.trim()) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/rules/${instanceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: draft }),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setRules((prev) => [...prev, saved]);
        setDraft("");
      }
    } catch (err) {
      console.error("Failed to save rule", err);
    }
  };

  // Clear textarea only
  const handleClear = () => {
    setDraft("");
  };

  return (
    <div className="space-y-4">
      {/* Textarea for typing rules */}
      <Textarea
        placeholder="Define a rule (e.g. 'If subject contains invoice, draft payment reply automatically')"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="min-h-[100px]"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save
        </Button>
        <Button variant="destructive" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Saved rules */}
      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-sm text-gray-500">No rules defined yet.</p>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="p-3 text-sm">
              {rule.text}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailRules;
