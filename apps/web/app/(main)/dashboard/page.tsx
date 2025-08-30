// apps/web/app/dashboard/page.tsx
'use client'

import Image, { StaticImageData } from "next/image"
import { useRouter } from "next/navigation"
import discord from "../../icons/discord.png"
import whatsapp from "../../icons/whatsapp.png"
import slack from "../../icons/slack.png"
import gmail from "../../icons/gmail.png"


type Integration = {
  name: string
  icon: React.ElementType | StaticImageData
  href?: string
  active: boolean
}

export default function DashboardPage() {
  const router = useRouter()

  const integrations: {
    comingNow: Integration[]
    comingSoon: Integration[]
  } = {
    comingNow: [
      { name: "Gmail", icon: gmail, href: "/dashboard/gmail", active: true }
    ],
    comingSoon: [
      { name: "Slack", icon: slack, active: false },
      { name: "Discord", icon: discord, active: false },
      { name: "OutLook", icon: whatsapp, active: false }
    ]
  }

  const renderIcon = (icon: React.ElementType | StaticImageData) => {
    if (typeof icon === "function") {
      const Icon = icon as React.ElementType
      return <Icon className="w-8 h-8 text-primary mb-3" />
    } else {
      return <Image src={icon} alt="icon" className="w-8 h-8 mb-3" />
    }
  }

  return (

      <main className="min-h-screen flex flex-col items-center justify-start bg-background px-6 py-10 dark:bg-[#1E1E1E]">
      <div className="max-w-4xl w-full ">
        <h1 className="text-3xl font-bold mb-2 text-foreground ">
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
                onClick={() => item.href && router.push(item.href)}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border dark:bg-zinc-700"
              >
                {/* {renderIcon(item.icon)} */}
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
                {/* {renderIcon(item.icon)} */}
                <span className="text-muted-foreground font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
