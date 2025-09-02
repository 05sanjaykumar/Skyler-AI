// apps/web/app/docs/getting-started/page.tsx

export default function GettingStarted() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Getting Started</h1>
      <p className="mb-4">
        Follow these steps to create your first inbox and start filtering
        emails:
      </p>

      <ol className="list-decimal list-inside space-y-2">
        <li>Log in with Google or Outlook from the Dashboard.</li>
        <li>Click <b>Create Inbox</b> and give it a relevant name.</li>
        <li>
          You can create up to <b>3 inboxes</b> on the free plan.
        </li>
        <li>
          Once created, open an inbox. You’ll be redirected to{" "}
          <code>/gmail/dashboard/[instance]</code>.
        </li>
        <li>
          Fill the form, save it, then click <b>Refresh Emails</b> to load
          results.
        </li>
      </ol>
    </div>
  );
}
