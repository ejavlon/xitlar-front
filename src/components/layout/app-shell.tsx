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
    <div className="min-h-screen w-full bg-[#0c1522] flex justify-center text-slate-800 font-sans overflow-x-hidden">
      {/* 1300px Single Unified Website Container */}
      <div className="w-full max-w-[1300px] min-h-screen bg-white flex flex-col shadow-2xl relative">
        {/* 1. Header (Sticky / Top of Container) */}
        <Header onMenuToggle={toggleMobileMenu} />

        {/* 2. Main Content & Right Sidebar (Inside the single container) */}
        <div className="flex-1 flex flex-col lg:flex-row pb-24 relative bg-white">
          {/* Main Content Area (Left / Center) */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 bg-white">
            {children}
          </main>

          {/* Right Column: Desktop Navigation Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 p-4 border-l border-slate-100 bg-white">
            <Sidebar />
          </aside>
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
    </div>
  );
}

