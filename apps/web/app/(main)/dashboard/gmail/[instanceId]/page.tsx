// apps/web/app/dashboard/gmail/[instanceId]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/db";
import { useMailStore } from "@/store/mails";


// import PromptSection from "@/components/Gmail/PromptSection";
import EmailsSection from "@/components/Gmail/EmailsSection";
import EmailDetail from "@/components/Gmail/EmailDetail";
import ReplySection from "@/components/Gmail/ReplySection";
import GmailForm from "@/components/Gmail/GmailForm";

type Email = {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string;
  date: string;
  payload: any;
  snippet: string;
};

export default function InstanceDetailPage({ params }: { params: Promise<{ instanceId: string }> }) {
    const { instanceId } = use(params);
  const { data: session, status } = useSession();

  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // grab zustand state/actions
  const {
    emails,
    emailsLoading,
    loadCachedEmails,
    saveEmails,
    selectedEmail,
    setSelectedEmail,
  } = useMailStore();

  // fetch instance metadata
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

  // fetch + cache emails from backend
  const fetchEmails = async () => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/pull/${instanceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.appToken || ""}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        await saveEmails(instanceId, data.messages);
        console.log("Fetched emails:", data.messages);
      }
    } catch (err) {
      console.error("Failed fetching emails:", err);
    }
  };

  // load cached emails on mount
  useEffect(() => {
    if (status === "authenticated") {
      loadCachedEmails(instanceId);
    }
  }, [instanceId, session?.appToken, status, loadCachedEmails]);

  if (loading) return <div>Loading instance...</div>;
  if (!instance) return <div>Instance not found</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side: Prompt + Emails */}
      <div className="w-full md:w-3/5 p-4 border-r border-gray-300 overflow-auto">
        <h1 className="text-2xl font-bold mb-4 uppercase">{instance.name} INSTANCE</h1>

        <GmailForm 
        instance={instance} 
        onGenerate={fetchEmails} 
        />

        <div className="mt-8 border-2 border-black p-2 rounded-sm dark:border-white">
          <h2 className="text-xl font-semibold mb-2">Emails</h2>
          {emailsLoading ? (
            <p>Loading emails...</p>
          ) : (
            <EmailsSection
              emails={emails}
              onSelect={setSelectedEmail}
            />
          )}
        </div>
      </div>

      {/* Right side: Email Detail + Reply */}
      <div className="w-full md:w-3/5 p-4 overflow-auto flex flex-col">
        {selectedEmail ? (
          <>
            <EmailDetail emailId={selectedEmail.id} />
            <ReplySection instanceId={instanceId} email={selectedEmail} />
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10">Select an email to view details</div>
        )}
      </div>
    </div>
  );
}
