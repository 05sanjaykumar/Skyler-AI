// apps/web/app/(main)/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"
import Link from "next/link";


interface ProfileData {
  name: string | null;
  email: string | null;
  image: string | null;
  creditsRemaining: number;
  planExpirationDate: string | null;
  transactions: {
    id: string;
    amount: number;
    status: string;
    paymentProvider: string | null;
    currency: string;
    createdAt: string;
  }[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const token = session?.appToken;

  // Helper to get the auth token if using something like JWT
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // or wherever your token is
  })


  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${backendUrl}/api/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="flex items-center gap-4 p-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
          <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{profile.name || "Unnamed User"}</h2>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </Card>

      {/* Credits + Plan Info */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Credits Remaining</span>
            <span className="font-medium">{profile.creditsRemaining}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plan Expiration</span>
            <span className="font-medium">
              {profile.planExpirationDate
                ? new Date(profile.planExpirationDate).toLocaleDateString()
                : "No active plan"}
            </span>
          </div>
          <div className="pt-3">
            <Button className="w-full" onClick={() => router.push("/payments/plans")}>Buy Credits</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!profile?.transactions || profile.transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {profile.transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {txn.paymentProvider || "Unknown"} – {txn.currency} {txn.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      txn.status === "success"
                        ? "bg-green-100 text-green-700"
                        : txn.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push("/support")}>
            Get Support
          </Button>
        </CardContent>
      </Card>

      {/* Privacy policy, terms condition, refund */}
      
      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <Link href="/legal/privacy" className="text-sm">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="text-sm">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/legal/refund" className="text-sm">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/disclaimer" className="text-sm">
                Disclaimer
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/*  LogOut Button */}
      <Card>
        <CardHeader>
          <CardTitle>Log Out</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={() => signOut()}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
