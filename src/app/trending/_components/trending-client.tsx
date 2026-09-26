"use client";

import { useState, useMemo, useCallback } from "react";
import { Track } from "../../../types/track";
import { TrackList } from "../../../components/music/track-list";
import { ArrowLeft, Flame, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "../../../stores/player-store";
import { cn } from "../../../lib/utils";

const TABS = [
  { key: "today", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

type TabKey = typeof TABS[number]["key"];

interface TrendingClientProps {
  initialTracks: Track[];
}

export function TrendingClient({ initialTracks }: TrendingClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const router = useRouter();
  const playQueue = usePlayerStore((s) => s.playQueue);

  // useMemo: activeTab o'zgargandagina qayta hisoblanadi
  const filteredTracks = useMemo(() => {
    if (activeTab === "today") return initialTracks.slice(0, 15);
    if (activeTab === "weekly") return initialTracks.slice(0, 30);
    return initialTracks;
  }, [initialTracks, activeTab]);

  const handlePlayAll = useCallback(() => {
    if (filteredTracks.length > 0) {
      playQueue(filteredTracks, 0);
    }
  }, [filteredTracks, playQueue]);

  return (
    <div className="space-y-6 select-none animate-fade-in font-sans">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Tabs */}
      <div className="border-b border-slate-200 pt-2">
        <div className="flex gap-8 text-xs font-bold tracking-wider uppercase select-none">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative pb-3 transition-colors focus:outline-none font-semibold cursor-pointer",
                activeTab === tab.key
                  ? "text-slate-800"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks List */}
      <section className="bg-white rounded-xl border border-slate-100 p-2 shadow-2xs">
        <TrackList
          tracks={filteredTracks}
          fallbackText="No trending tracks found for this period."
        />
      </section>
    </div>
  );
}
