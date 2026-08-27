"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User as UserType } from "@/types/user";
import { Track } from "@/types/track";
import { Artist } from "@/types/artist";
import { Playlist } from "@/types/playlist";
import { userService } from "@/services/user.service";
import { musicService } from "@/services/music.service";
import { artistService } from "@/services/artist.service";
import { TrackRow } from "@/components/music/track-row";
import { ArtistGrid } from "@/components/music/artist-grid";
import { PlaylistGrid } from "@/components/music/playlist-grid";
import { cn } from "@/lib/utils";
import { Loader, Heart, Bell, Film, Plus } from "lucide-react";

type ProfileTab =
  | "likes"
  | "playlists"
  | "collections"
  | "artists"
  | "clips"
  | "updates"
  | "comments";

interface TabDef {
  key: ProfileTab;
  label: string;
}

const PROFILE_TABS: TabDef[] = [
  { key: "likes", label: "MY LIKES" },
  { key: "playlists", label: "PLAYLISTS" },
  { key: "collections", label: "COLLECTIONS" },
  { key: "artists", label: "ARTISTS" },
  { key: "clips", label: "CLIPS" },
  { key: "updates", label: "UPDATES" },
  { key: "comments", label: "COMMENTS" },
];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get("tab") as ProfileTab) || "likes";

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams?.get("tab") as ProfileTab;
    if (tabParam && PROFILE_TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, trackData, artistData, playlistData] = await Promise.all([
          userService.getCurrentUser(),
          musicService.getPopularTracks(),
          artistService.getArtists(),
          musicService.getPlaylists(),
        ]);
        setCurrentUser(userData);
        setTracks(trackData);
        setArtists(artistData);
        setPlaylists(playlistData);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userName = currentUser?.name || "Javlon";
  const userEmail = currentUser?.email || "javlon2677572@gmail.com";

  // Filtered collections / playlists
  const userPlaylists = playlists.filter((p) => !p.isCollection);
  const userCollections = playlists.filter((p) => p.isCollection);

  // Mock liked tracks (first 8 popular tracks for demonstration)
  const likedTracks = tracks.slice(0, 8);

  return (
    <div className="space-y-6 select-none animate-fade-in font-sans">
      {/* 1. TOP PROFILE HEADER SECTION (Matches Sefon Screenshot) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 pt-2">
        {/* Grey User Silhouette Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#cbd5e1] flex items-end justify-center overflow-hidden shrink-0 shadow-inner">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 text-white fill-current translate-y-1"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        {/* User Details & 2-Column Menu Links */}
        <div className="space-y-2.5 min-w-0">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {userName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
          </div>

          {/* Sub Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600 pt-1">
            {/* Column 1 */}
            <div className="space-y-1">
              <Link
                href="/profile?tab=updates"
                className="flex items-center gap-1.5 hover:text-[#365377] transition-colors"
              >
                <span>Messages</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              </Link>
              <div>
                <Link href="/profile?tab=updates" className="hover:text-[#365377] transition-colors">
                  News
                </Link>
              </div>
              <div>
                <Link href="#orders" className="hover:text-[#365377] transition-colors">
                  Requests
                </Link>
              </div>
              <div>
                <Link href="/profile?tab=updates" className="hover:text-[#365377] transition-colors">
                  Updates
                </Link>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-1">
              <div>
                <Link href="#help" className="hover:text-[#365377] transition-colors">
                  Help
                </Link>
              </div>
              <div>
                <Link href="/settings" className="hover:text-[#365377] transition-colors">
                  Settings
                </Link>
              </div>
              <div>
                <button
                  onClick={() => alert("Logout (presentation state)")}
                  className="hover:text-red-500 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thin Horizontal Divider */}
      <div className="border-t border-slate-200/80 pt-2" />

      {/* 2. PROFILE HORIZONTAL TABS (Matching Screenshot) */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          {PROFILE_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "pb-2.5 text-xs font-bold tracking-wider transition-all whitespace-nowrap border-b-2 -mb-px select-none focus:outline-none",
                  isActive
                    ? "border-[#365377] text-[#365377]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Loader className="w-6 h-6 text-[#365377] animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading your music...</p>
        </div>
      ) : (
        <div className="pt-2">
          {/* TAB: MY LIKES */}
          {activeTab === "likes" && (
            <div className="space-y-2">
              {likedTracks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Heart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>You have no liked tracks yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white rounded-lg border border-slate-100">
                  {likedTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      playlistTracks={likedTracks}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PLAYLISTS */}
          {activeTab === "playlists" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {userPlaylists.length} playlists
                </span>
              </div>
              <PlaylistGrid
                playlists={userPlaylists}
                showCreateCard={true}
                fallbackText="No user playlists found."
              />
            </div>
          )}

          {/* TAB: COLLECTIONS */}
          {activeTab === "collections" && (
            <div className="space-y-4">
              <PlaylistGrid
                playlists={userCollections}
                fallbackText="No collections saved yet."
              />
            </div>
          )}

          {/* TAB: ARTISTS */}
          {activeTab === "artists" && (
            <div className="space-y-4">
              <ArtistGrid
                artists={artists}
                fallbackText="You are not following any artists yet."
              />
            </div>
          )}

          {/* TAB: CLIPS */}
          {activeTab === "clips" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tracks.slice(0, 6).map((track) => (
                <div
                  key={track.id}
                  className="group bg-slate-50 rounded-lg overflow-hidden border border-slate-200/80 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => alert(`Playing clip: ${track.title}`)}
                >
                  <div className="relative aspect-video bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-[#365377] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Film className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {track.artist.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: UPDATES */}
          {activeTab === "updates" && (
            <div className="space-y-3">
              {[
                {
                  id: "1",
                  title: "Eminem released a new single",
                  time: "2 hours ago",
                  icon: Bell,
                },
                {
                  id: "2",
                  title: "Rayhon added 3 new tracks to 'Top Hits'",
                  time: "Yesterday",
                  icon: Bell,
                },
                {
                  id: "3",
                  title: "System update: New lossless HQ audio player enabled",
                  time: "3 days ago",
                  icon: Bell,
                },
              ].map((update) => (
                <div
                  key={update.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#365377] flex items-center justify-center shrink-0">
                    <update.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {update.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {update.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: COMMENTS */}
          {activeTab === "comments" && (
            <div className="space-y-3">
              {[
                {
                  id: "c1",
                  track: "Eminem — Mockingbird",
                  comment: "One of the greatest tracks of all time!",
                  date: "2 days ago",
                },
                {
                  id: "c2",
                  track: "Doxx — Yurak",
                  comment: "Juda ajoyib trek, ovoz zo'r chiqqan.",
                  date: "1 week ago",
                },
              ].map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#365377]">
                      {c.track}
                    </span>
                    <span className="text-[10px] text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
