// apps/web/app/legal/disclaimer/page.tsx
export default function DisclaimerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SkylerInbox Beta Disclaimer</h1>
      <p className="mb-4">
        SkylerInbox is currently in beta. Please note the following:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>The product may contain bugs or incomplete features.</li>
        <li>AI-generated drafts are suggestions; you must review all content before sending.</li>
        <li>Gmail API changes or restrictions may affect functionality.</li>
        <li>We are not liable for any misclassifications, missed emails, or unintended actions.</li>
        <li>Beta features and limits (100 users, 3 inboxes per user, credit limits) are subject to change.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">
        Use of SkylerInbox beta constitutes acceptance of this disclaimer.
      </p>
    </div>
  );
}
