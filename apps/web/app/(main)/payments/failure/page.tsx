'use client'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-500">Payment Failed ❌</h1>
      <p className="mt-4 text-gray-400">Something went wrong. Please try again or use another payment method.</p>
      <Button className="mt-6" onClick={() => router.push("/payments")}>
        Back to Pricing
      </Button>
    </div>
  );
}
