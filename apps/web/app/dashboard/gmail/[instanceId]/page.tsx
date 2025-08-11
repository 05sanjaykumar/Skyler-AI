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
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side: Prompt + Emails */}
      <div className="w-full md:w-3/5 p-4 border-r border-gray-300 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{instance.name}</h1>

        <PromptSection instance={instance} />

        <div className="mt-8 border-2 border-black p-2 rounded-sm dark:border-white">
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
      <div className="w-full md:w-3/5 p-4 overflow-auto flex flex-col">
        {selectedEmail ? (
          <>
            <EmailDetail email={selectedEmail} />
            <ReplySection instanceId={instanceId} email={selectedEmail} />
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10">Select an email to view details</div>
        )}
      </div>
    </div>
  );
}
