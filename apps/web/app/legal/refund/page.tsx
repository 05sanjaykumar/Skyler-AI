// apps/web/app/legal/refund/page.tsx
export default function RefundPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SkylerInbox Refund Policy (Beta)</h1>
      <p className="mb-4">
        SkylerInbox is currently in beta. Paid credits may be purchased for AI features such as draft generation. Please read the following refund policy carefully:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Refunds are available <b>within 3 days of purchase</b> and only for <b>unused credits</b>.</li>
        <li>Once credits are consumed or used to generate drafts, they are <b>non-refundable</b>.</li>
        <li>To request a refund, contact support at <strong>support@skylerinbox.com</strong> or use the in-app support form.</li>
        <li>Refunds are typically processed within <b>5–7 business days</b>.</li>
        <li>SkylerInbox reserves the right to <b>decline refunds</b> if the terms above are not met.</li>
        <li>By purchasing credits, you acknowledge that SkylerInbox is in <b>beta</b>, and features or pricing may change without prior notice.</li>
      </ul>
    </div>
  );
}
