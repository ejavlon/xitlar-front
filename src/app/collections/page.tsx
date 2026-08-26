"use client";

import { useEffect, useState } from "react";
import { Playlist } from "../../types/playlist";
import { musicService } from "../../services/music.service";
import { PlaylistGrid } from "../../components/music/playlist-grid";
import { Loader } from "lucide-react";
import { cn } from "../../lib/utils";

export default function CollectionsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "playlists" | "collections">("all");

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const data = await musicService.getPlaylists();
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching collections:", err);
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
        <p className="text-xs text-slate-400 font-medium">Opening music library...</p>
      </div>
    );
  }

  // Filter collections/playlists
  const filtered = playlists.filter((p) => {
    if (activeTab === "playlists") return !p.isCollection;
    if (activeTab === "collections") return p.isCollection;
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="pb-2 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Library & Collections
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Curated music selections and user playlists
        </p>
      </div>

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
      <PlaylistGrid playlists={filtered} fallbackText={`No ${activeTab === "all" ? "items" : activeTab} available in your library.`} />
    </div>
  );
}

