'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const plans = [
  {
    name: "Starter",
    price: "FREE",
    description: "For individuals and small teams getting started.",
    features: ["10 AI Instances", "20 Credits", "Approx 10 Completions", "Infinite Manual Edits"],
    isPopular: false,
    amount: 0,
    planId: "starter",
  },
  {
    name: "Mini",
    price: "$5",
    description: "For growing businesses and marketing professionals.",
    features: ["10 AI Instances", "100 Credits", "Approx 60-70 Completions", "Infinite Manual Edits"],
    isPopular: true,
    amount: 5,
    planId: "mini",
  },
  {
    name: "Pro",
    price: "$10",
    description: "For large organizations with custom needs.",
    features: ["10 AI Instances", "200 Credits", "Approx 120-140 Completions", "Infinite Manual Edits"],
    isPopular: false,
    amount: 10,
    planId: "pro",
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const token = session?.appToken;

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, 
  })

  const handlePayment = async (plan: typeof plans[0]) => {
  if (plan.amount === 0) {
    alert("You have selected the free plan!");
    router.push("/dashboard");
    return;
  }

  setLoadingPlan(plan.planId);

  try {
    // 1. Create PayPal order
    const orderRes = await fetch(`${backendUrl}/api/paypal/order`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ amount: plan.amount, plan: plan.planId }),
    });

    if (!orderRes.ok) throw new Error("Failed to create PayPal order");
    const order = await orderRes.json();

    // 2. Load PayPal SDK dynamically
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      window.paypal.Buttons({
        createOrder: () => order.id,
        onApprove: async (data: any, actions: any) => {
          try {
            const captureRes = await fetch(`${backendUrl}/api/paypal/capture`, {
              method: "POST",
              headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ orderId: data.orderID, plan: plan.planId }),
            });

            if (!captureRes.ok) throw new Error("Failed to capture PayPal order");
            const capture = await captureRes.json();

            if(capture?.userData) {
                const { creditsRemaining, planExpirationDate } = capture.userData;
                router.push(`/payments/success?credits=${creditsRemaining}&expiry=${planExpirationDate}`);
            } else {
              router.push("/payments/failure");
            }
          } catch (err) {
            console.error(err);
            alert("Payment capture failed. Please try again.");
          }
        },
        onError: (err: any) => {
          console.error(err);
          alert("PayPal error occurred. Please try again.");
        }
      }).render("#paypal-button-container");
    };
  } catch (err) {
    console.error(err);
    alert("Something went wrong while creating the order.");
  } finally {
    setLoadingPlan(null);
  }
};


  return (
    <div className="bg-[#0A0A0A] text-gray-200 min-h-screen antialiased">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tighter">Skyler</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Choose the Plan That Fits Your Flow
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Simple, transparent pricing. Start for free and scale as you grow. No hidden fees, ever.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <Card 
              key={plan.name} 
              className={`bg-black border-2 flex flex-col ${plan.isPopular ? 'border-violet-500 shadow-lg shadow-violet-500/10' : 'border-gray-800'} transition-transform hover:-translate-y-2`}
            >
              <CardHeader className="relative text-white">
                {plan.isPopular && (
                  <div className="absolute -top-4 right-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "FREE" && <span className="text-lg font-normal text-gray-400">/ month</span>}
                </div>
                <CardDescription className="pt-2 !mt-0">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-white">
                <ul className="space-y-4">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handlePayment(plan)}
                  className={`w-full text-white ${plan.isPopular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  disabled={loadingPlan === plan.planId}
                >
                  {plan.price === "FREE" ? "Get Started" : "Choose Plan"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-400">Need more? <a href="#" className="text-violet-400 font-medium underline">Contact us for enterprise solutions.</a></p>
        </div>

        {/* PayPal Button Container */}
        <div id="paypal-button-container" className="mt-8"></div>
      </main>
    </div>
  );
}
