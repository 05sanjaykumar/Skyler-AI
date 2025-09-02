// apps/web/app/docs/rules/page.tsx

export default function Rules() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Rules</h1>
      <p className="mb-4">
        Rules let you apply AI-based summaries to your emails.
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li>
          Each inbox can have its own rules.
        </li>
        <li>
          Define rules in the text area above Email Details.
        </li>
        <li>
          Save your rules to reuse them across emails.
        </li>
        <li>
          Use the <b>Generate Summary with Rules</b> button to get AI drafts.
        </li>
        <li>
          Summaries can be opened in Gmail for final editing and sending.
        </li>
      </ul>
    </div>
  );
}
