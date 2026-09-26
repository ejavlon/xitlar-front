"use client";

import { useState, useMemo } from "react";
import { Playlist } from "../../../types/playlist";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { cn } from "../../../lib/utils";

interface PlaylistsClientProps {
  initialPlaylists: Playlist[];
}

export function PlaylistsClient({ initialPlaylists }: PlaylistsClientProps) {
  const [filter, setFilter] = useState<"all" | "curated" | "user">("all");

  const filteredPlaylists = useMemo(() => {
    return initialPlaylists.filter((p) => {
      if (filter === "curated") return p.isCollection;
      if (filter === "user") return !p.isCollection;
      return true;
    });
  }, [initialPlaylists, filter]);

  return (
    <>
      {/* Header and Filter Buttons */}
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
      <PlaylistGrid
        playlists={filteredPlaylists}
        fallbackText="No playlists found in this category."
      />
    </>
  );
}
