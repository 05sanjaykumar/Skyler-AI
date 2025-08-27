'use client'
import { useState } from "react";
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
    setLoading(true);
    try {
        console.log(`Creating Cashfree order for plan: ${plan.planId} and price: ${plan.amount}`);
      const orderRes = await fetch(`${backendUrl}/api/cashfree/order`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: plan.amount, plan: plan.planId }),
      });
      if (!orderRes.ok) throw new Error("Failed to create Cashfree order");

      const { payment_session_id } = await orderRes.json();
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
          .then((result: any) => {
            if (result.error) {
              router.push("/payments/failure");
            } else {
              const { creditsRemaining, planExpirationDate } = result;
              console.log('Cashfree payment result:', result);
              router.push(`/payments/success?credits=${creditsRemaining}&expiry=${planExpirationDate}`);
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
