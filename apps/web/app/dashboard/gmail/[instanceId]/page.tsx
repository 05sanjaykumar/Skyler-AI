// apps/web/app/dashboard/gmail/[instanceId]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// import PromptSection from "@/components/PromptSection";
import PromptSection from "@/components/main/PromptSection";
import EmailsSection from "@/components/main/EmailsSection";
import EmailDetail from "@/components/main/EmailDetail";
import ReplySection from "@/components/main/ReplySection";

type Email = {
  id: string;
  subject: string;
  body: string;
};

export default function InstanceDetailPage({ params }: { params: Promise<{ instanceId: string }> }) {
  const { instanceId } = use(params);
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailsLoading, setEmailsLoading] = useState(false);

  // Fetch instance data
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchInstance = async () => {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instances/${instanceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.appToken || ""}`,
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setInstance(data);
      }
      setLoading(false);
    };

    fetchInstance();
  }, [instanceId, session?.appToken, status]);

  // Fetch emails on load & when instance changes
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchEmails = async () => {
      setEmailsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instances/${instanceId}/emails`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.appToken || ""}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
      setEmailsLoading(false);
    };

    fetchEmails();
  }, [instanceId, session?.appToken, status]);

  if (loading) return <div>Loading instance...</div>;
  if (!instance) return <div>Instance not found</div>;

  return (
    <div className="flex gap-6 h-[80vh] p-4">
      {/* Left side: Prompt + Emails */}
      <div className="flex-1 overflow-y-auto border p-4 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">{instance.name}</h1>

        <PromptSection instance={instance} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Emails</h2>
          {emailsLoading ? (
            <p>Loading emails...</p>
          ) : (
            <EmailsSection
              emails={emails}
              onSelect={setSelectedEmail}
              onDelete={(id) => setEmails((prev) => prev.filter((e) => e.id !== id))}
            />
          )}
        </div>
      </div>

      {/* Right side: Email Detail + Reply */}
      <div className="w-[400px] flex flex-col border p-4 rounded shadow overflow-y-auto">
        {selectedEmail ? (
          <>
            <EmailDetail email={selectedEmail} />
            <ReplySection instanceId={instanceId} email={selectedEmail} />
          </>
        ) : (
          <p>Select an email to view details and reply</p>
        )}
      </div>
    </div>
  );
}
