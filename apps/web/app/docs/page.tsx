// apps/web/app/docs/page.tsx
'use client'

export default function DocsOverview() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">Skyler Inbox - Documentation</h1>
      <p className="mb-4">
        Welcome to Skyler Inbox. With Skyler you can create multiple inboxes
        (instances), filter emails with AI, and generate summaries with rules.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">How It Works</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Choose an email provider (e.g., Gmail, Outlook) from the{" "}
          <b>Dashboard</b>.
        </li>
        <li>
          Create an inbox (instance). Free plan allows up to <b>3 inboxes</b>.
        </li>
        <li>
          Open your inbox to see a form and email section. Use the form to
          define filters, and view results in the email list.
        </li>
        <li>
          The left side shows your <b>Email List</b>, the right side shows{" "}
          <b>Email Details</b>.
        </li>
        <li>
          Apply <b>Rules</b> above Email Details to generate AI summaries.
        </li>
      </ul>
    </div>
  );
}
