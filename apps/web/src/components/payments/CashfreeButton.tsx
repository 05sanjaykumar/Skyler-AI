// apps/web/src/components/payments/CashfreeButton.tsx
'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CashfreeButton({ plan }: { plan: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = session?.appToken;

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const handleCashfreePayment = async () => {
    if (!plan) return;
    setLoading(true);

    try {
      const orderRes = await fetch(`${backendUrl}/api/cashfree/order`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: plan.amount, plan: plan.planId }),
      });
      if (!orderRes.ok) throw new Error("Failed to create Cashfree order");

      const { payment_session_id, order_id } = await orderRes.json(); // ✅ capture order_id
      console.log("Cashfree Order Response:", { payment_session_id, order_id });

      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const cf = (window as any).Cashfree?.({ mode: "sandbox" });
        if (!cf) {
          alert("Cashfree SDK failed to load.");
          return;
        }

        cf.checkout({ paymentSessionId: payment_session_id, redirectTarget: "_modal" })
          .then(async (result: any) => {
            if (result.error) {
              router.push("/payments/failure");
            } else {
              // ✅ use captured order_id here
              const response = await fetch(`${backendUrl}/api/cashfree/check-status`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ order_id }),
              });

              const data = await response.json();
              console.log("Check-status response:", data);

              if (data.status === "success") {
                const { creditsRemaining, planExpirationDate } = data.userData;
                router.push(`/payments/success?credits=${creditsRemaining}&expiry=${planExpirationDate}`);
              } else {
                router.push("/payments/failure");
              }
            }
          });
      };
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <button disabled={loading} onClick={handleCashfreePayment} className="bg-gray-700 px-6 py-2 rounded text-white">
      {loading ? "Loading..." : "Pay with Cashfree"}
    </button>
  );
}
