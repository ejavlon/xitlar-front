"use client";

import { useEffect, useState } from "react";
import { Track } from "../../types/track";
import { musicService } from "../../services/music.service";
import { TrackList } from "../../components/music/track-list";
import { Loader, ArrowLeft, Flame, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "../../stores/player-store";
import { cn } from "../../lib/utils";

export default function TrendingPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "monthly">("today");
  const router = useRouter();
  const playQueue = usePlayerStore((s) => s.playQueue);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await musicService.getPopularTracks();
        setTracks(data);
      } catch (err) {
        console.error("Error loading trending hits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Filter tracks based on selected time range
  const filteredTracks = activeTab === "today"
    ? tracks.slice(0, 15)
    : activeTab === "weekly"
      ? tracks.slice(0, 30)
      : tracks;

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playQueue(filteredTracks, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading trending hits...</p>
      </div>
    );
  }

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

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#365377] to-[#507cae] p-6 text-white shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
          <Flame className="w-10 h-10 text-amber-400 fill-amber-400" />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Trending Hits
          </h1>
          <p className="text-xs text-slate-200 font-medium max-w-xl">
            The top most popular and trending songs right now on Xitlar, updated in real-time based on plays and likes.
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={filteredTracks.length === 0}
              className="flex items-center gap-2 px-5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-full transition-colors shadow-xs focus:outline-none disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Listen</span>
            </button>
            <span className="text-xs text-slate-200 font-mono">
              {filteredTracks.length} tracks
            </span>
          </div>
        </div>
      </div>

      {/* Tabs (Matches Screenshot 1 style but in English) */}
      <div className="border-b border-slate-200 pt-2">
        <div className="flex gap-8 text-xs font-bold tracking-wider uppercase select-none">
          {([
            { key: "today", label: "Daily" },
            { key: "weekly", label: "Weekly" },
            { key: "monthly", label: "Monthly" }
          ] as const).map((tab) => (
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
        <TrackList tracks={filteredTracks} fallbackText="No trending tracks found for this period." />
      </section>
    </div>
  );
}
