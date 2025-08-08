// apps/web/src/components/top-bar.tsx
'use client';
import { Bell, Sun, Moon, Settings, Crown, User } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`w-full transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'} shadow-lg transition-colors`}>
            S
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>
              Skyler AI
            </span>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Upgrade Button */}
          <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </button>

          {/* Notifications */}
          <button className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${isDark ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
            <Bell className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${isDark ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>


          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg`}
            >
              JD
            </button>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className={`absolute right-0 top-12 w-48 rounded-lg shadow-2xl border transition-all duration-200 z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>John Doe</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>john@example.com</p>
                </div>
                <div className="p-1">
                  <button className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} flex items-center space-x-2`}>
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} flex items-center space-x-2`}>
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className={`my-1 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                  <button className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}