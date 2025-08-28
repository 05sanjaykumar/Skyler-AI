'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PaypalButton({ plan }: { plan: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = session?.appToken;

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const handlePaypalPayment = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch(`${backendUrl}/api/paypal/order`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: plan.amount, plan: plan.planId }),
      });
      if (!orderRes.ok) throw new Error("Failed to create PayPal order");
      const order = await orderRes.json();

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // @ts-ignore
        window.paypal.Buttons({
          createOrder: () => order.id,
          onApprove: async (data: any) => {
            const captureRes = await fetch(`${backendUrl}/api/paypal/capture`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({ orderId: data.orderID, plan: plan.planId }),
            });

            if (!captureRes.ok) throw new Error("Failed to capture PayPal order");
            const capture = await captureRes.json();

            if (capture?.userData) {
              const { creditsRemaining, planExpirationDate } = capture.userData;
              router.push(`/payments/success?credits=${creditsRemaining}&expiry=${planExpirationDate}`);
            } else {
              router.push("/payments/failure");
            }
          },
          onError: () => router.push("/payments/failure"),
        }).render("#paypal-btn");
      };
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div id="paypal-btn" className="my-6" />
      <button disabled={loading} onClick={handlePaypalPayment} className="bg-violet-600 px-6 py-2 rounded text-white">
        {loading ? "Loading..." : "Pay with PayPal"}
      </button>
    </div>
  );
}
