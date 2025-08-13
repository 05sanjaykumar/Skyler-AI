// apps/web/src/components/main/ReplySection.tsx
"use client";

import { useState } from "react";

export default function ReplySection({
  instanceId,
  email,
}: {
  instanceId: string;
  email: { id: string; subject: string };
}) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  async function sendReply() {
    if (!replyText.trim()) return;

    setSending(true);
    // Replace this with your actual reply API call
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/emails/${email.id}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ replyText }),
    });
    setReplyText("");
    setSending(false);
    alert("Reply sent!");
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Reply to: {email.subject}</h3>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows={6}
        className="w-full border p-2 rounded mb-2 bg-background"
        placeholder="Type your reply..."
      />
      <button
        onClick={sendReply}
        disabled={sending}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send Reply"}
      </button>
    </div>
  );
}
