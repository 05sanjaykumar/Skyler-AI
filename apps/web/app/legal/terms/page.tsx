// apps/web/app/legal/terms.tsx
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">SkylerInbox Terms & Conditions (Beta)</h1>
      <p className="mb-4">
        Welcome to SkylerInbox beta! By using this application, you agree to the following terms:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>This is a beta product limited to 100 users.</li>
        <li>AI-generated drafts are suggestions; you are responsible for final emails.</li>
        <li>Gmail access is read-only; your emails are cached locally and not stored on our servers.</li>
        <li>Credit system applies for generating drafts.</li>
        <li>We reserve the right to modify or suspend beta features at any time.</li>
      </ul>
    </div>
  );
}
