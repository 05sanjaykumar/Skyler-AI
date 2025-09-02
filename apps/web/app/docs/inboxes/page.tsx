// apps/web/app/docs/inboxes/page.tsx

export default function Inboxes() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inboxes</h1>
      <p className="mb-4">
        Inboxes (instances) let you isolate and manage different email
        configurations.
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li>
          Each inbox has its own form, email section, and rules.
        </li>
        <li>
          Free plan: <b>3 inboxes</b>.
        </li>
        <li>
          Mini plan: <b>10 inboxes</b> (permanent).
        </li>
        <li>
          Pro plan: <b>25 inboxes</b> (permanent).
        </li>
        <li>
          Once created, inboxes are never downgraded or deleted — even if your
          subscription expires.
        </li>
      </ul>
    </div>
  );
}
