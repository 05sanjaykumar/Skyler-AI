"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading...</p>;
  if (!session) return redirect("/login");
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-2">Your Skyler Dashboard</h1>
      <p className="text-gray-500">View tasks, prompts and organize your inbox</p>
    </main>
  );
}
