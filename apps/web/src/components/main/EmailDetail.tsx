// apps/web/src/components/main/EmailsDetails.tsx

"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Email {
  id: string;
  subject: string;
  body: string; // this will be HTML
}

interface EmailDetailProps {
  emailId: string;
}

export default function EmailDetail({ emailId }: EmailDetailProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading email...</p>;
  if (!email) return <p>Email not found.</p>;

  return (
    <div className="mb-4 max-h-[80vh] overflow-auto">
      <h2 className="text-xl font-semibold">{email.subject}</h2>
      <div
        className="mt-2"
        dangerouslySetInnerHTML={{ __html: email.body }}
      />
    </div>
  );
}
