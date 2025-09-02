// apps/web/docs/legal/page.tsx

export default function Legal() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Legal</h1>
      <p className="mb-4">
        Skyler Inbox respects your privacy and keeps your data secure.
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li>
          Emails are <b>cached locally</b> in your browser for fast access.
        </li>
        <li>
          Emails are only processed on the server to filter/summarize, but
          never stored.
        </li>
        <li>
          Sensitive information stays isolated per inbox.
        </li>
        <li>
          See the full legal policy in the dedicated legal section.
        </li>
      </ul>
    </div>
  );
}

