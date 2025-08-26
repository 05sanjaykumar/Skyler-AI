// apps/web/src/components/main/EmailsDetails.tsx

"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DOMPurify from "dompurify";

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

interface EmailDetailProps {
  emailId: string;
  instanceId: string;
}

export default function EmailDetail({ emailId, instanceId }: EmailDetailProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState<Email | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

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
          console.log('rules loaded :', data.ruleBox);
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

    console.log('Fill here')
  };

  return (
    <div className="mb-4 max-h-[80vh] overflow-auto">
      <h2 className="text-xl font-semibold">{email.subject}</h2>
      <div className="mt-2" dangerouslySetInnerHTML={{ __html: cleanBody }} />

      {rules.length > 0 && (
        <button
          onClick={handleQuickReply}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Quick Reply
        </button>
      )}
    </div>
  );
}