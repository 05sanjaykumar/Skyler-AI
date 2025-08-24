// apps/web/src/components/main/EmailsSection.tsx
"use client";

import { useSession } from "next-auth/react";
import { Email } from "@/../types/email";
import { useMailStore } from "@/store/mails";


export default function SearchBox({
  emails,
  onSelect,
  instance
}: {
  emails: Email[];
  onSelect: (email: Email) => void;
  instance: any;
}) {
  const { data: session } = useSession();
  const { deleteCachedEmail } = useMailStore();


  if (emails.length === 0) return <p>No emails found.</p>;

  return (
    <ul className="divide-y max-h-[410px] divide-gray-200 dark:divide-gray-700 rounded-lg overflow-y-auto border border-gray-200 dark:border-gray-700">
  {emails.map((email) => (
    <li
      key={email.id}
      className="p-4 flex justify-between items-start cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex-1" onClick={() => onSelect(email)}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {email.subject || "(No Subject)"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {email.snippet || email.body}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent triggering onSelect
          deleteCachedEmail(instance.id,email.id);
        }}
        className="ml-4 text-xs text-red-500 hover:text-red-600 transition-colors"
      >
        Delete
      </button>
    </li>
  ))}
</ul>
  );
}
