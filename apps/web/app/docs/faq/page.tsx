// apps/web/docs/faq/page.tsx

export default function FAQ() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">FAQ</h1>

      <h2 className="text-lg font-semibold mt-6 mb-2">How many inboxes can I create?</h2>
      <p>Free: 3 inboxes. Mini: 10 inboxes forever. Pro: 25 inboxes forever.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">What happens if my plan expires?</h2>
      <p>Your credits reset to 25/month, but inboxes are never downgraded or deleted.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Do you store my emails?</h2>
      <p>No. Emails are cached locally in your browser and only processed temporarily on the server.</p>

    </div>
  );
}
