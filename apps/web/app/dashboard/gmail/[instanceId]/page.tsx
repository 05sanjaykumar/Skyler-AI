// apps/web/app/dashboard/gmail/[instanceId]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function InstanceDetailPage({ params }: { params: Promise<{ instanceId: string }> }) {
  const { instanceId } = use(params);
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return; // wait for auth

    const fetchInstance = async () => {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instances/${instanceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.appToken || ""}`,
        },
        credentials: "include", // uncomment if backend uses cookies
      });
      if (res.ok) {
        const data = await res.json();
        setInstance(data);
      }
      setLoading(false);
    };

    fetchInstance();
  }, [instanceId, session?.appToken, status]);

  if (loading) return <div>Loading...</div>;
  if (!instance) return <div>Instance not found</div>;

  return (
    <div>
      <h1>{instance.name}</h1>
      <p>Prompt: {instance.promptName || "No prompt assigned"}</p>
    </div>
  );
}
