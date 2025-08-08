// apps/web/src/components/top-bar.tsx
'use client';
import { Bell, Sun, Moon, Settings, Crown, User, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  return (
    <div className="w-full h-16 bg-white border-b-2 border-gray-300 flex items-center justify-between px-6">
      {/* Left side - Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 text-white font-bold text-lg flex items-center justify-center rounded-xl">
          S
        </div>
        <span className="text-xl font-bold text-gray-900">Skyler AI</span>
      </div>

      {/* Right side - Test buttons */}
      <div className="flex items-center space-x-4">
        
        {/* Test 1: Simple button */}
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          RED TEST
        </button>

        {/* Test 2: Purple button */}
        <button className="bg-purple-500 text-white px-4 py-2 rounded">
          PURPLE TEST
        </button>

        {/* Test 3: Text only */}
        <span className="text-blue-500 font-bold">TEXT TEST</span>

        {/* Test 4: User info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 text-white text-sm flex items-center justify-center rounded">
            JD
          </div>
          <span className="text-sm font-medium">John Doe</span>
        </div>

      </div>
    </div>
  );
}