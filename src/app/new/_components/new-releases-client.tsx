"use client";

import { useState, useMemo } from "react";
import { Track } from "../../../types/track";
import { TrackRow } from "../../../components/music/track-row";
import { cn } from "../../../lib/utils";

type FilterTab = "all" | "international" | "local";

interface NewReleasesClientProps {
  initialTracks: Track[];
}

export function NewReleasesClient({ initialTracks }: NewReleasesClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredTracks = useMemo(() => {
    if (activeTab === "all") return initialTracks;
    // For tabs: can filter if genres or language flags are added, currently preserves initial list
    return initialTracks;
  }, [initialTracks, activeTab]);

  return (
    <>
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
    </>
  );
}
