// apps/web/src/components/top-bar.tsx
'use client';
import { Bell, Sun, Moon, Settings, Crown, User, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} transition-colors duration-200`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-md">
              S
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Skyler AI
              </h1>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Upgrade Button */}
            <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-600 hover:to-purple-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>

            {/* Notifications */}
            <button 
              className={`relative rounded-lg p-2 transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Notification dot */}
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`rounded-lg p-2 transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>


            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                  JD
                </div>
                <div className="hidden lg:block text-left">
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    John Doe
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    john@example.com
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Overlay */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Menu */}
                  <div className={`absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-lg border shadow-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* User Info - Mobile */}
                    <div className={`lg:hidden border-b px-4 py-3 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        John Doe
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        john@example.com
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                        <User className="h-4 w-4" />
                        Profile
                      </button>
                      
                      <button className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      
                      <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />
                      
                      <button className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-gray-700' 
                          : 'text-red-600 hover:bg-gray-50'
                      }`}>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}