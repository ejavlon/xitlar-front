"use client";

import { useEffect, useState } from "react";
import { Playlist } from "../../types/playlist";
import { musicService } from "../../services/music.service";
import { PlaylistGrid } from "../../components/music/playlist-grid";
import { Loader } from "lucide-react";
import { cn } from "../../lib/utils";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "curated" | "user">("all");

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const data = await musicService.getPlaylists();
        setPlaylists(data);
      } catch (err) {
        console.error("Error loading playlists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Gathering compilations...</p>
      </div>
    );
  }

  const filteredPlaylists = playlists.filter((p) => {
    if (filter === "curated") return p.isCollection;
    if (filter === "user") return !p.isCollection;
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Playlists & Compilations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated playlists for every mood and moment
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {([
            { key: "all", label: "All Playlists" },
            { key: "curated", label: "Curated" },
            { key: "user", label: "Custom Lists" }
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border focus:outline-none shrink-0",
                filter === tab.key
                  ? "bg-[#365377] border-[#365377] text-white"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Grid */}
      <PlaylistGrid playlists={filteredPlaylists} fallbackText="No playlists found in this category." />
    </div>
  );
}

