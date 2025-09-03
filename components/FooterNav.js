"use client";
import Link from "next/link";
import { Home, Bot, FolderOpen } from "lucide-react";

export default function FooterNav() {
  return (
    <footer className="sticky bottom-0 z-20 bg-white border-t border-gray-200 py-2 sm:py-3 shadow-md">
      <div className="flex justify-around items-center">
        <Link
          href="/"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition"
        >
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white mb-1">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-xs">Home</span>
        </Link>

        <Link
          href="/chat"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition"
        >
          <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white mb-1">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-xs">AI Chat</span>
        </Link>

        <Link
          href="/"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition"
        >
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-1">
            <FolderOpen className="w-5 h-5" />
          </div>
          <span className="text-xs">Categories</span>
        </Link>
      </div>
    </footer>
  );
}
