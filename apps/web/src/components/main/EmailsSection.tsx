// apps/web/src/components/main/EmailsSection.tsx
"use client";

import { useSession } from "next-auth/react";

type Email = {
  id: string;
  subject: string;
  body: string;
};

export default function EmailsSection({
  emails,
  onSelect,
  onDelete,
}: {
  emails: Email[];
  onSelect: (email: Email) => void;
  onDelete: (emailId: string) => void;
}) {
  const { data: session } = useSession();

  async function deleteEmail(id: string) {
    if (!session?.appToken) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/emails/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.appToken}`,
      },
    });
    if (res.ok) {
      onDelete(id);
    }
  }

  if (emails.length === 0) return <p>No emails found.</p>;

  return (
    <ul className="space-y-2 max-h-[300px] overflow-y-auto">
      {emails.map((email) => (
        <li
          key={email.id}
          className="flex justify-between items-center cursor-pointer border p-3 rounded hover:bg-gray-100"
        >
          <span onClick={() => onSelect(email)}>{email.subject}</span>
          <button
            onClick={() => deleteEmail(email.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
