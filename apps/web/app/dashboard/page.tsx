// apps/web/app/dashboard/page.tsx
'use client'
import AuthGuard from "@/lib/auth-wrapper";
import { signOut } from "next-auth/react";
export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-2">Your Skyler Dashboard</h1>
        <p className="text-gray-500">View tasks, prompts and organize your inbox</p>
         <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </main>
    </AuthGuard>
  );
}

