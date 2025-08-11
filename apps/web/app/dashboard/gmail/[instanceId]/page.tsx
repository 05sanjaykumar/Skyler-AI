// apps/web/app/dashboard/gmail/[instanceId]/page.tsx

type InstancePageProps = {
  params: {
    instanceId: string;
  };
};

export default async function InstanceDetailPage({ params }: InstancePageProps) {
  const { instanceId } =await params;

  // Fetch that specific instance
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/instances/${instanceId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return <div>Instance not found</div>;
  }

  const instance = await res.json();

  return (
    <div>
      <h1>{instance.name}</h1>
      <p>Prompt: {instance.promptName || "No prompt assigned"}</p>
    </div>
  );
}
