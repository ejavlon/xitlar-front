"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNavigation } from "./mobile-navigation";
import { MusicPlayer } from "../player/music-player";
import { useMobile } from "../../hooks/use-mobile";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile(1024);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#edf0f5] text-slate-800 overflow-hidden font-sans">
      {/* 1. Header (Sticky Top) */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* 2. Main Content & Right Sidebar Container */}
      <div className="flex-1 overflow-y-auto pb-28 md:pb-24 lg:pb-24 relative">
        <div className="max-w-[1240px] mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-5 items-start animate-fade-in">
          {/* Main Content Area (Left / Center) */}
          <main className="flex-1 min-w-0 w-full bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            {children}
          </main>

          {/* Right Column: Desktop Navigation Sidebar */}
          <div className="hidden lg:block w-[270px] shrink-0 sticky top-4">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* 3. Mobile Slide-out Drawer */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={toggleMobileMenu}
          />

          {/* Sidebar Drawer */}
          <div className="relative flex flex-col w-[280px] h-full bg-white animate-slide-in shadow-2xl z-50 overflow-y-auto p-4 border-r border-slate-200">
            {/* Close Button */}
            <button
              onClick={toggleMobileMenu}
              className="self-end p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none mb-2"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sidebar content */}
            <Sidebar onClose={toggleMobileMenu} />
          </div>
        </div>
      )}

      {/* 4. Persistent Global Music Player */}
      <div className="relative w-full z-45">
        <MusicPlayer />
      </div>

      {/* 5. Mobile Navigation */}
      <MobileNavigation onMenuToggle={toggleMobileMenu} />
    </div>
  );
}

