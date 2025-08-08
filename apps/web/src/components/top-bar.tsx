// apps/web/src/components/top-bar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { 
  Settings, 
  Crown, 
  LogOut, 
  Sun,
  Moon,
  ChevronDown
} from "lucide-react";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const TopBar = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const userName = session?.user?.name || "Guest";
  const userImage = session?.user?.image;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Skyler AI</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 p-0"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Upgrade */}
          <Button size="sm" variant="outline">
            <Crown className="h-4 w-4 mr-1" />
            Upgrade
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={userImage || ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:block">{userName}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;