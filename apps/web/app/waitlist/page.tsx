"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Optional toast notifications

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");
    
    setLoading(true);

    try {
      // Example API call to save email
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("You’ve been added to the waitlist!");
        setEmail("");
      } else {
        toast.error("Something went wrong. Try again later.");
      }
    } catch (err) {
      toast.error("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Join the Skyler Inbox Beta</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Enter your email below to get early access and approval for the beta version.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Join Waitlist"}
        </Button>
      </form>
    </div>
  );
}
