// apps/web/app/(main)/payments/plans/page.tsx
'use client'
import { plans } from "@/lib/plans";
import { PlanCard } from "@/components/payments/PlanCard";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center">Choose a Plan</h1>
      <p className="text-center text-gray-500 mt-2">Simple pricing. No hidden fees.</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <PlanCard
            key={plan.planId}
            plan={plan}
            onSelect={() => router.push(`/payments/checkout/${plan.planId}`)}
          />
        ))}
      </div>
    </div>
  );
}
