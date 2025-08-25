// apps/web/app/dashboard/gmail/[instanceId]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMailStore } from "@/store/gmail/mails";

import SearchBox from "@/components/Gmail/SearchBox";
import EmailDetail from "@/components/Gmail/EmailDetail";
import ReplySection from "@/components/Gmail/ReplySection";
import GmailForm from "@/components/Gmail/GmailForm";
import StoreBox from "@/components/Gmail/StoreBox";

import { Search, Archive } from "lucide-react";

export default function InstanceDetailPage({ params }: { params: Promise<{ instanceId: string }> }) {
  const { instanceId } = use(params);
  const { data: session, status } = useSession();

  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeBox, setActiveBox] = useState<"search" | "store">("search");

  // grab zustand state/actions
  const {
    emails,
    emailsLoading,
    loadCachedEmails,
    selectedEmail,
    setSelectedEmail,
    fetchEmailsFromBackend
  } = useMailStore();

  // fetch instance metadata
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchInstance = async () => {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/instances/${instanceId}`, {
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
    fetchEmailsFromBackend(instanceId, session?.appToken || "");
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

        <GmailForm instance={instance} onGenerate={fetchEmails} />

        {/* toggle buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setActiveBox("search")}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              activeBox !== "search" ? "bg-black text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <Search size={16} /> Search
          </button>
          <button
            onClick={() => setActiveBox("store")}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              activeBox !== "store" ? "bg-black text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <Archive size={16} /> Store
          </button>
        </div>

        {/* active box content */}
        <div className="mt-6 border-2 border-black p-2 rounded-sm dark:border-white">
          <h2 className="text-xl font-semibold mb-2">
            {activeBox === "search" ? "Search Results" : "Stored Emails"}
          </h2>

          {activeBox === "search" ? (
            emailsLoading ? (
              <div className="p-4 text-gray-500">Searching emails...</div>
            ) : (
              <SearchBox emails={emails} instance={instance} onSelect={setSelectedEmail} />
            )
          ) : (
            <StoreBox instance={instance} onSelect={setSelectedEmail} />
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
          <div className="text-center text-gray-500 mt-10">
            Select an email to view details
          </div>
        )}
      </div>
    </div>
  );
}
