// apps/web/app/legal/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SkylerInbox Privacy Policy (Beta)</h1>
      <p className="mb-4">
        Your privacy is important. This policy explains what data we collect and how it is used:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>We collect your user info, OAuth tokens, Instance rules, transactions, and credit logs.</li>
        <li>Email content is <strong>not stored on our servers</strong>; it remains cached locally for processing.</li>
        <li>AI processing (classification and summarization) happens on the client-side or restricted backend.</li>
        <li>Third-party services (Groq, payment processors) may handle certain processing or payments; we do not share raw email content with them.</li>
        <li>We use minimal information necessary for credits, AI rules, and user authentication.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">
        By using SkylerInbox beta, you consent to this data handling policy.
      </p>
    </div>
  );
}
