"use client";

import { useState, useMemo } from "react";
import { Playlist } from "../../../types/playlist";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { cn } from "../../../lib/utils";

interface CollectionsClientProps {
  initialPlaylists: Playlist[];
}

export function CollectionsClient({ initialPlaylists }: CollectionsClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "playlists" | "collections">("all");

  const filtered = useMemo(() => {
    return initialPlaylists.filter((p) => {
      if (activeTab === "playlists") return !p.isCollection;
      if (activeTab === "collections") return p.isCollection;
      return true;
    });
  }, [initialPlaylists, activeTab]);

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {([
          { key: "all", label: "All Items" },
          { key: "playlists", label: "Playlists" },
          { key: "collections", label: "Featured Collections" }
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border focus:outline-none shrink-0",
              activeTab === tab.key
                ? "bg-[#365377] border-[#365377] text-white"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Display Grid */}
      <PlaylistGrid
        playlists={filtered}
        fallbackText={`No ${activeTab === "all" ? "items" : activeTab} available in your library.`}
      />
    </>
  );
}
