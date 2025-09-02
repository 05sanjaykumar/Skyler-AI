// apps/web/docs/emails/page.tsx

export default function Emails() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Emails</h1>
      <p className="mb-4">
        Each inbox has two main sections: the Email List and Email Details.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Email List</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Displays emails with date, sender, and snippet.
        </li>
        <li>
          Updates when you refresh with saved form filters.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Email Details</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Shows full content of selected email.
        </li>
        <li>
          Options available: <b>View Full Email</b> or <b>Apply Rules</b>.
        </li>
        <li>
          Can open directly in Gmail for attachments or advanced actions.
        </li>
      </ul>
    </div>
  );
}
