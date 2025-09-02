// apps/web/app/docs/forms/page.tsx
export default function Forms() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Forms</h1>
      <p className="mb-4">
        Forms allow you to filter emails using Gmail parameters and AI filters.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Gmail Parameters</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>From, To, Subject</li>
        <li>Date ranges: Before, After</li>
        <li>Other Gmail query parameters</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">AI Filters</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <b>AI Keywords:</b> e.g., “finance”, “bad performance”, “work
          opportunities”.
        </li>
        <li>
          <b>Sentiment Analysis:</b> any / positive / negative.
        </li>
        <li>
          <b>Semantic Search:</b> on/off with adjustable threshold (0.0–1.0).
          <ul className="list-disc list-inside ml-6">
            <li>
              0.1 → broad matching (very inclusive)
            </li>
            <li>
              0.9 → very strict matching
            </li>
          </ul>
        </li>
        <li>
          <b>Result Limit:</b> 1–200 emails can be retrieved.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Actions</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <b>Save Form:</b> store your filter permanently.
        </li>
        <li>
          <b>Refresh Emails:</b> fetch new emails (1 credit used).
        </li>
      </ul>
    </div>
  );
}
