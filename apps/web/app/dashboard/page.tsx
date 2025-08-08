// apps/web/app/dashboard/page.tsx
'use client'


import { useRouter } from "next/navigation"
import { Mail, Slack, Trello, FileText } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  const integrations = {
    comingNow: [
      { name: "Gmail", icon: Mail, href: "/dashboard/gmail", active: true }
    ],
    comingSoon: [
      { name: "Slack", icon: Slack, active: false },
      { name: "Notion", icon: FileText, active: false },
      { name: "Trello", icon: Trello, active: false }
    ]
  }

  return (

      <main className="min-h-screen flex flex-col items-center justify-start bg-background px-6 py-10">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Your Skyler Dashboard
          </h1>
          <p className="text-muted-foreground mb-8">
            View tasks, prompts, and organize your inbox
          </p>

          {/* Coming Now */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Active Now</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {integrations.comingNow.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(item.href!)}
                  className="flex flex-col items-center justify-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border"
                >
                  <item.icon className="w-8 h-8 text-primary mb-3" />
                  <span className="text-foreground font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Coming Soon */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Coming Soon</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {integrations.comingSoon.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted shadow-sm border opacity-60 cursor-not-allowed"
                >
                  <item.icon className="w-8 h-8 text-muted-foreground mb-3" />
                  <span className="text-muted-foreground font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

  )
}
