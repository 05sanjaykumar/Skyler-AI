"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DOMPurify from "dompurify";
import { toast, Toaster } from "sonner";
import { useCreditsStore } from "@/store/credits-store";

interface Email {
  id: string;
  subject: string;
  body: string; // this will be HTML
  from?: string;
  to?: string;
  snippet?: string;
}

interface Rule {
  id: string;
  text: string;
  template?: string;
}

interface QuickReplyResult {
  summary: string;
  draft: string;
  bestRule: Rule;
}

interface EmailDetailProps {
  emailId: string;
  instanceId: string;
}

export default function EmailDetail({ emailId, instanceId }: EmailDetailProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState<Email | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickReply, setQuickReply] = useState<QuickReplyResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const { deductCredits } = useCreditsStore();

  // fetch email
  useEffect(() => {
    async function fetchEmail() {
      if (!session?.appToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/pull/full/${emailId}`,
          {
            headers: {
              Authorization: `Bearer ${session.appToken}`,
            },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch email");
        const data = await res.json();
        setEmail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmail();
  }, [emailId, session]);

  // fetch rules
  useEffect(() => {
    async function fetchRules() {
      if (!session?.appToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/rulebox/${instanceId}`,
          {
            headers: {
              Authorization: `Bearer ${session.appToken}`,
            },
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setRules(data.ruleBox || []);
        }
      } catch (err) {
        console.error("Failed to fetch rules", err);
      }
    }

    fetchRules();
  }, [instanceId, session]);

  if (loading) return <p>Loading email...</p>;
  if (!email) return <p>Email not found.</p>;

  const cleanBody = DOMPurify.sanitize(email.body);

  const handleQuickReply = async () => {
    if (!email || rules.length === 0) return;
    if (!session?.appToken) return;

    setGenerating(true);
    try {
      const plainTextBody = DOMPurify.sanitize(email.body, { ALLOWED_TAGS: [] });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/summarise/${instanceId}/groq`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.appToken || ""}`,
          },
          credentials: "include",
          body: JSON.stringify({
            emailBody: plainTextBody,
            emailFrom: email.from,
          }),
        }
      );

      if (!res.ok) {
        toast.error("Failed to generate quick reply");
        return;
      }
      const ok = await deductCredits(session.appToken, 1);

      if (!ok) {
        toast.error("Not enough credits to generate quick reply");
        return;
      }

      const data = await res.json();
      setQuickReply({
        summary: data.summary,
        draft: data.draft,
        bestRule: data.bestRule,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mb-4 max-h-[80vh] overflow-auto">
      <Toaster position="top-right" richColors />
  <h2 className="text-xl font-semibold">{email.subject}</h2>

  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-background">
    <div className="max-h-[60vh] overflow-auto">
      <div dangerouslySetInnerHTML={{ __html: cleanBody }} />
    </div>

    {/* Action buttons grouped together */}
    <div className="flex gap-3 mt-4">
      {/* Direct open in Gmail */}
      <a
        href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(email.id)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Open in Gmail
      </a>

      {/* Quick Reply generator */}
      {rules.length > 0 && (
        <button
          onClick={handleQuickReply}
          disabled={generating}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Reply using Rules"}
        </button>
      )}
    </div>
  </div>

  {quickReply && (
    <div className="mt-4 p-4 border border-gray-300 bg-background rounded-lg">
      <h3 className="font-semibold mb-2">Draft</h3>
      <p className="mb-2"><strong>Rule Used:</strong> {quickReply.bestRule.text}</p>
      <p>{quickReply.draft}</p>

      {/* Open the generated draft in Gmail */}
      <a
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.from || '')}&su=${encodeURIComponent(email.subject || '')}&body=${encodeURIComponent(quickReply.draft)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-decoration-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Draft in Gmail
      </a>
    </div>
  )}
</div>

  );
}
