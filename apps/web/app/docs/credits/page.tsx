// apps/web/docs/credits/page.tsx

export default function Credits() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Credits</h1>
      <p className="mb-4">
        Credits are used whenever you filter emails or generate AI summaries.
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li>1 credit = 1 email refresh or 1 rule-based summary.</li>
        <li>
          Free users get <b>25 credits per month</b>.
        </li>
        <li>
          Upgrade to get more credits, depending on your plan.
        </li>
        <li>
          When plans expire, you return to 25 monthly credits.
        </li>
        <li>
          Upgraded plans preserve unused credits and extend their expiration.
        </li>
      </ul>
    </div>
  );
}
