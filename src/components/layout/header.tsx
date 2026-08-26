"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Music,
  PlaySquare,
  Users,
  Video,
  Bell,
  MessageSquare,
  MessageCircle,
  Settings,
  LogOut,
  AlignLeft,
  X
} from "lucide-react";
import Link from "next/link";
import { User as UserType } from "../../types/user";
import { userService } from "../../services/user.service";

interface HeaderProps {
  onMenuToggle?: () => void; // for mobile drawer toggle
}

function HeaderSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    router.push("/search");
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="relative flex-1 max-w-[460px] flex items-center"
    >
      <input
        type="text"
        placeholder="Find artist, track, album"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-3.5 pr-20 py-2 rounded-l-[4px] border-0 outline-none placeholder:text-slate-400 placeholder:text-xs shadow-inner"
      />

      {/* Clear Search Query button */}
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-12 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Orange Search button */}
      <button
        type="submit"
        className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-3.5 py-2.5 rounded-r-[4px] transition-colors flex items-center justify-center shrink-0 shadow-xs"
        aria-label="Search"
      >
        <Search className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  );
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user data via service layer
  useEffect(() => {
    userService.getCurrentUser().then(setCurrentUser).catch(console.error);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const userName = currentUser?.name || "Javlon";

  return (
    <header className="h-[var(--header-height)] bg-[#365377] text-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-1.5 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors lg:hidden focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <AlignLeft className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-[#f59e0b] group-hover:bg-[#d97706] transition-colors flex items-center justify-center shadow-sm">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white select-none">
              Xitlar
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden sm:flex items-center">
          <Suspense fallback={<div className="w-full h-9 bg-white/10 rounded-md animate-pulse" />}>
            <HeaderSearchBar />
          </Suspense>
        </div>

        {/* Right: User Menu & Mobile Search Icon */}
        <div className="flex items-center gap-3">
          {/* Mobile search button */}
          <Link
            href="/search"
            className="p-1.5 sm:hidden text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* User Button Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white text-slate-800 hover:bg-slate-100 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 rounded-md shadow-sm flex items-center gap-2 transition-all focus:outline-none select-none border border-slate-200"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span>{userName}</span>
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            </button>

            {/* Dropdown Menu (Matches Screenshot 2) */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white text-slate-700 rounded-md shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in text-xs font-medium divide-y divide-slate-100"
                role="menu"
              >
                <div className="py-1">
                  <Link
                    href="/collections"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <PlaySquare className="w-4 h-4 text-slate-400" />
                    <span>My Music</span>
                  </Link>

                  <Link
                    href="/playlists"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Music className="w-4 h-4 text-slate-400" />
                    <span>Playlists</span>
                  </Link>

                  <Link
                    href="/collections"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <PlaySquare className="w-4 h-4 text-slate-400" />
                    <span>Collections</span>
                  </Link>

                  <Link
                    href="/artists"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Artists</span>
                  </Link>

                  <Link
                    href="#videos"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Video className="w-4 h-4 text-slate-400" />
                    <span>Music Videos</span>
                  </Link>

                  <Link
                    href="#updates"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Updates</span>
                  </Link>
                </div>

                <div className="py-1">
                  <Link
                    href="#messages"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>Messages</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </Link>

                  <Link
                    href="#comments"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>Comments</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      alert("Logout (presentation state)");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

