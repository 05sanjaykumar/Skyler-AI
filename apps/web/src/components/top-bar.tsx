// apps/web/src/components/top-bar.tsx
'use client'

import { Bell, Sun, Moon, Settings, User, Copyright, Headset } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCreditsStore } from "@/store/credits-store"

export default function Topbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { credits, fetchCredits, loading } = useCreditsStore()


  // Prevent hydration mismatch with next-themes
  useEffect(() => {
    setMounted(true);
    if (session?.appToken) {
      fetchCredits(session.appToken)
    }
  }, [])


  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) return null

  return (
    <header className="w-full border-b bg-background dark:bg-zinc-900">
  <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-7xl mx-auto">
    
    {/* Left - Logo */}
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg">
        S
      </div>
      <span className="font-bold text-lg hidden sm:inline">Skyler AI</span>
      <div className="inline-flex items-center justify-center px-4 py-1 text-sm font-medium tracking-wide text-green-600 transition-colors duration-200 rounded-full bg-gray-100 dark:bg-slate-800">
        Beta ✨
      </div>
    </div>

    {/* Right - Actions */}
    <div className="flex items-center space-x-3">
      {/* Credits - Always show */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg text-sm text-gray-700 dark:text-gray-300">
        <span>{credits}</span>
        <Copyright className="w-4 h-4" />
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback>
              {session?.user?.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{session?.user?.name || "Guest"}</span>
              <span className="text-sm text-muted-foreground">{session?.user?.email || ""}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* These will only show on mobile */}
          <div className="block md:hidden">
            <DropdownMenuItem onClick={() => router.push("/payments")}>
              <Copyright className="w-4 h-4 mr-2" /> Buy Credits
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              Toggle Theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>

          {/* Always show */}
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/support")}>
            <Headset className="w-4 h-4 mr-2" /> Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* These will only show on desktop */}
      <div className="hidden md:flex items-center space-x-2">
        <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg" onClick={() => router.push("/payments")}>
          <Copyright className="w-4 h-4 mr-2" />
          Buy Credits
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  </div>
</header>

  )
}
