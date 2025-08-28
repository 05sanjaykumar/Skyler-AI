'use client'
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { plans } from "@/lib/plans";
import { PaymentMethodToggle } from "@/components/payments/PaymentMethodToggle";
import PaypalButton from "@/components/payments/PaypalButton";
import CashfreeButton from "@/components/payments/CashfreeButton";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { planId } = useParams();
  const router = useRouter();
  const plan = plans.find(p => p.planId === planId);

  useEffect(() => {
    console.log(`CheckoutPage mounted with plan: ${plan?.amount}`);
  }, [planId]);

  const [method, setMethod] = React.useState<"paypal" | "cashfree">("paypal");

  if (!plan) {
    return <p className="text-center py-12">Plan not found.</p>;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Checkout – {plan.name}</h1>
        <Button variant="ghost" onClick={() => router.push("/payments/plans")}>
          Back
        </Button>
      </div>

      <div className="mb-6">
        <PaymentMethodToggle value={method} onChange={setMethod} />
      </div>

      {plan.amount === 0 ? (
        <Button className="w-full" onClick={() => router.push("/dashboard")}>
          Start Free Plan
        </Button>
      ) : (
        <>
          {method === "paypal" && <PaypalButton plan={plan} />}
          {method === "cashfree" && <CashfreeButton plan={plan} />}
        </>
      )}
    </div>
  );
}
