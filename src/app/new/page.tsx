"use client";

import { useEffect, useState } from "react";
import { Track } from "../../types/track";
import { musicService } from "../../services/music.service";
import { TrackRow } from "../../components/music/track-row";
import { Loader } from "lucide-react";
import { cn } from "../../lib/utils";

type FilterTab = "all" | "international" | "local";

export default function NewReleasesPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const popular = await musicService.getPopularTracks();
        // Combine with all available tracks for a richer list
        const allTracks = await musicService.searchTracks("");
        const combined = [...popular];
        allTracks.forEach((t) => {
          if (!combined.find((c) => c.id === t.id)) {
            combined.push(t);
          }
        });
        // Sort by release date (newest first)
        combined.sort((a, b) => {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        });
        setTracks(combined);
      } catch (err) {
        console.error("Error fetching new releases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  // Filter tracks by tab
  // In mock mode, "international" = artists with English names, "local" = others
  // For now, all tracks show under "all"; tabs are UI-ready for real API
  const filteredTracks = tracks;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading new releases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none animate-fade-in font-sans">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          New Music
        </h1>
      </div>

      {/* Filter Tabs: ALL / INTERNATIONAL / LOCAL */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-0">
        {([
          { key: "all" as FilterTab, label: "ALL" },
          { key: "international" as FilterTab, label: "INTERNATIONAL" },
          { key: "local" as FilterTab, label: "LOCAL" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative pb-2.5 text-xs sm:text-sm font-bold tracking-wide transition-colors focus:outline-none",
              activeTab === tab.key
                ? "text-amber-500"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-2xs">
        {filteredTracks.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No new releases found.
          </div>
        ) : (
          filteredTracks.map((track, idx) => (
            <TrackRow
              key={`new-${track.id}-${idx}`}
              track={track}
              index={idx}
              playlistTracks={filteredTracks}
            />
          ))
        )}
      </div>
    </div>
  );
}
