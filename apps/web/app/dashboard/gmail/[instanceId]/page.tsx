// apps/web/app/dashboard/gmail/[instanceId]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/db";

// import PromptSection from "@/components/PromptSection";
import PromptSection from "@/components/main/PromptSection";
import EmailsSection from "@/components/main/EmailsSection";
import EmailDetail from "@/components/main/EmailDetail";
import ReplySection from "@/components/main/ReplySection";

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
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailsLoading, setEmailsLoading] = useState(false);

    // Helper functions for Dexie
  async function saveEmails(emails: Email[]) {
    await db.emails.where("instanceId").equals(instanceId).delete();
    const emailsWithInstance = emails.map(email => ({
      ...email,
      instanceId,
    }));
    await db.emails.bulkPut(emailsWithInstance); // directly store as-is
    console.log("Emails cached locally!: ", emailsWithInstance);
  }

  async function loadEmails(): Promise<Email[]> {
    const cachedEmails = await db.emails.where("instanceId").equals(instanceId).toArray();

    const normalized: Email[] = cachedEmails.map((e) => ({
      id: e.id,
      subject: e.subject,
      body: e.body || "",        // default to empty string
      from: e.from,
      to: e.to,
      date: e.date,
      payload: e.payload || {},  // default to empty object
      snippet: e.snippet,
    }));

    return normalized;
  }

  // Load cached emails first; fallback to fetch if empty
  const loadCachedEmails = async () => {
    setEmailsLoading(true);

    const cachedEmails = await loadEmails();
    if (cachedEmails.length > 0) {
      setEmails(cachedEmails);
      console.log("Loaded emails from cache:", cachedEmails);
    }
    setEmailsLoading(false);
  };


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
  const fetchEmails = async () => {
    if (status !== "authenticated") return;

    setEmailsLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/pull/${instanceId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.appToken || ""}`,
      },
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setEmails(data.messages);
      await saveEmails(data.messages);
      console.log("Fetched emails:", data.messages);
    }
    setEmailsLoading(false);
  };

  // Run once on mount
  useEffect(() => {
    loadCachedEmails();
  }, [instanceId, session?.appToken, status]);

  if (loading) return <div>Loading instance...</div>;
  if (!instance) return <div>Instance not found</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side: Prompt + Emails */}
      <div className="w-full md:w-3/5 p-4 border-r border-gray-300 overflow-auto">
        <h1 className="text-2xl font-bold mb-4 uppercase">{instance.name} INSTANCE</h1>

        <PromptSection 
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
              onDelete={(id) => setEmails((prev) => prev.filter((e) => e.id !== id))}
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
