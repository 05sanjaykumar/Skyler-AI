// apps/web/app/(main)/payments/checkout/[planId]/page.tsx
'use client'
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { plans } from "@/lib/plans";
import { PaymentMethodToggle } from "@/components/payments/PaymentMethodToggle";
import PaypalButton from "@/components/payments/PaypalButton";
import CashfreeButton from "@/components/payments/CashfreeButton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const { planId } = useParams();
  const router = useRouter();
  const plan = plans.find(p => p.planId === planId);

  const [method, setMethod] = React.useState<"paypal" | "cashfree">("paypal");

  useEffect(() => {
    console.log(`CheckoutPage mounted with plan: ${plan?.amount}`);
  }, [planId]);

  if (!plan) {
    return <p className="text-center py-12">Plan not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-gray-50 py-16 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        <Card className="shadow-lg border border-gray-200 dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Checkout – {plan.name}
            </CardTitle>
            <p className="text-gray-500">
              You’re almost there! Review your plan and complete payment below.
            </p>
          </CardHeader>

          <CardContent>
            {/* Plan Summary */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.amount > 0 && (
                  <span className="text-gray-500">/ month</span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{plan.description}</p>

              <ul className="space-y-2">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Section */}
            {plan.amount === 0 ? (
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Start Free Plan
              </Button>
            ) : (
              <>
                <PaymentMethodToggle value={method} onChange={setMethod} />

                <div className="mt-6">
                  {method === "paypal" && <PaypalButton plan={plan} />}
                  {method === "cashfree" && <CashfreeButton plan={plan} />}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter>
            <p className="text-xs text-gray-500">
              Secure payment powered by {method === "paypal" ? "PayPal" : "Cashfree"}.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
