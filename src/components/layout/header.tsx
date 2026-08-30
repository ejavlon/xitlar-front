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
  X,
  Play,
  Pause,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { User as UserType } from "../../types/user";
import { Track } from "../../types/track";
import { Artist } from "../../types/artist";
import { userService } from "../../services/user.service";
import { musicService } from "../../services/music.service";
import { artistService } from "../../services/artist.service";
import { usePlayerStore } from "../../stores/player-store";
import { useAuthStore } from "../../stores/auth-store";
import { formatDuration } from "../../lib/formatters";
import { cn } from "../../lib/utils";

interface HeaderProps {
  onMenuToggle?: () => void; // for mobile drawer toggle
}

function HeaderSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedTracks, setSuggestedTracks] = useState<any[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
  const isAudioPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Live search query fetching
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSuggestedTracks([]);
      setSuggestedArtists([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const [tracks, artists] = await Promise.all([
          musicService.searchTracks(query),
          artistService.searchArtists(query)
        ]);
        setSuggestedTracks(tracks.slice(0, 4));
        setSuggestedArtists(artists.slice(0, 3));
        setIsOpen(true);
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Outside click to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(false);
    router.push("/search");
  };

  const hasSuggestions = suggestedArtists.length > 0 || suggestedTracks.length > 0;

  return (
    <div ref={containerRef} className="relative w-[600px] max-w-full">
      <form
        onSubmit={handleSearchSubmit}
        className="relative w-full h-[30px] flex items-center rounded-lg overflow-hidden bg-white shadow-xs"
      >
        <input
          type="text"
          placeholder="Search by artist or track name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim() && hasSuggestions) {
              setIsOpen(true);
            }
          }}
          className="flex-1 h-full bg-white text-slate-900 text-[12px] px-3 border-0 outline-none placeholder:text-slate-600 focus:placeholder:text-slate-400 placeholder:transition-colors placeholder:text-xs"
        />

        {/* Clear Search Query button */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 mr-0.5"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Orange Search button */}
        <button
          type="submit"
          className="h-full bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 px-3.5 transition-colors flex items-center justify-center shrink-0"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5] text-slate-900" />
        </button>
      </form>
      
      {isOpen && searchQuery.trim() && (
        <div className="absolute left-0 right-0 top-[35px] bg-white rounded-lg shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in-50 duration-150 text-slate-800">
          {isLoading && !hasSuggestions ? (
            <div className="p-4 text-center text-xs text-slate-400">Searching...</div>
          ) : hasSuggestions ? (
            <div className="py-2 divide-y divide-slate-100">
              {/* Artists Section */}
              {suggestedArtists.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 px-1">
                    Artists
                  </div>
                  <div className="space-y-1">
                    {suggestedArtists.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/artists/${artist.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-[#365377] truncate">
                            {artist.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {artist.trackCount} tracks
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracks Section */}
              {suggestedTracks.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 px-1">
                    Tracks
                  </div>
                  <div className="space-y-1">
                    {suggestedTracks.map((track) => {
                      const isThisPlaying = currentTrackId === track.id && isAudioPlaying;
                      return (
                        <div
                          key={track.id}
                          onClick={() => {
                            if (currentTrackId === track.id) {
                              togglePlay();
                            } else {
                              playTrack(track, suggestedTracks);
                            }
                          }}
                          className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                            <button
                              type="button"
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                                isThisPlaying
                                  ? "bg-[#365377] border-[#365377] text-white"
                                  : "border-slate-300 text-slate-600 group-hover:border-[#365377] group-hover:text-[#365377]"
                              )}
                              aria-label={isThisPlaying ? "Pause" : "Play"}
                            >
                              <Play className={cn("w-2.5 h-2.5 ml-0.5", isThisPlaying && "fill-current")} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-slate-800 group-hover:text-[#365377] truncate">
                                {track.artist.name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {track.title}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">
                            {formatDuration(track.duration)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View All Results Footer Link */}
              <div className="px-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }}
                  className="w-full text-left text-xs font-medium text-[#365377] hover:text-[#284160] hover:underline px-2 py-1.5 flex items-center justify-between"
                >
                  <span>View all results for &ldquo;{searchQuery.trim()}&rdquo;</span>
                  <span>&rsaquo;</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No results found for &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAuthorized = isAuthenticated && (user?.role === "ADMIN" || user?.role === "MODERATOR");

  useEffect(() => {
    setMounted(true);
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

  const userName = user ? (user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username) : "Guest";

  return (
    <header className="h-[66px] bg-[#456690] text-white flex items-center justify-between px-4 sticky top-0 z-40 shadow-xs w-full">
      {/* Left: Brand Logo & Mobile Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-1 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors lg:hidden focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <AlignLeft className="w-4.5 h-4.5" />
        </button>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded bg-[#f59e0b] group-hover:bg-[#d97706] transition-colors flex items-center justify-center shadow-xs">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white select-none">
            Xitlar
          </span>
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-[600px] mx-2 sm:mx-4 hidden sm:flex items-center justify-center">
        <Suspense fallback={<div className="w-full h-[30px] bg-white/10 rounded animate-pulse" />}>
          <HeaderSearchBar />
        </Suspense>
      </div>

      {/* Right: User Menu & Mobile Search Icon */}
      <div className="flex items-center gap-2">
        {/* Mobile search button */}
        <Link
          href="/search"
          className="p-1.5 sm:hidden text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </Link>

        {/* User Button Pill & Dropdown / Sign In Button */}
        {mounted && isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-[115px] h-[30px] bg-white text-slate-800 hover:bg-slate-50 text-[12px] font-semibold rounded-[4px] shadow-xs flex items-center justify-center gap-2 transition-all focus:outline-none select-none border border-slate-200/80 shrink-0 cursor-pointer"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="truncate">{userName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shrink-0" />
            </button>

            {/* Dropdown Menu (Matches Screenshot) */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white text-slate-700 rounded-md shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in text-xs font-medium divide-y divide-slate-100"
                role="menu"
              >
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <PlaySquare className="w-4 h-4 text-slate-400" />
                    <span>My Music</span>
                  </Link>

                  <Link
                    href="/profile?tab=playlists"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Music className="w-4 h-4 text-slate-400" />
                    <span>Playlists</span>
                  </Link>

                  <Link
                    href="/profile?tab=collections"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <PlaySquare className="w-4 h-4 text-slate-400" />
                    <span>Collections</span>
                  </Link>

                  <Link
                    href="/profile?tab=artists"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Artists</span>
                  </Link>

                  <Link
                    href="/profile?tab=clips"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-[#365377] transition-colors"
                    role="menuitem"
                  >
                    <Video className="w-4 h-4 text-slate-400" />
                    <span>Clips</span>
                  </Link>

                  <Link
                    href="/profile?tab=updates"
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
                    href="/profile?tab=updates"
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
                    href="/profile?tab=comments"
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

                  {isAuthorized && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-indigo-650 transition-colors font-semibold"
                      role="menuitem"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="w-[115px] h-[30px] bg-white text-slate-800 hover:bg-slate-50 text-[12px] font-semibold rounded-[4px] shadow-xs flex items-center justify-center transition-all border border-slate-200/80 shrink-0"
          >
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}

