'use client'
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const credits = searchParams.get("credits");
  const expiry = searchParams.get("expiry");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-green-500">Payment Successful ✅</h1>

      <p className="mt-4 text-gray-400">
        Your plan has been activated.
      </p>

      {credits && (
        <p className="mt-2 text-lg font-semibold text-foreground">
          🎉 You now have <span className="text-violet-400">{credits}</span> credits!
        </p>
      )}

      {expiry && (
        <p className="mt-1 text-gray-400">
          Plan valid until <span className="text-gray-200">{new Date(expiry).toDateString()}</span>
        </p>
      )}

      <Button className="mt-6" onClick={() => router.push("/dashboard")}>
        Go to Dashboard
      </Button>
    </div>
  );
}
