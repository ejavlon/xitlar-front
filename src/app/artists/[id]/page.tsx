"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Artist } from "../../../types/artist";
import { Track } from "../../../types/track";
import { artistService, ArtistTrackSortMode } from "../../../services/artist.service";
import { usePlayerStore } from "../../../stores/player-store";
import { TrackList } from "../../../components/music/track-list";
import {
  Play,
  Share2,
  Star,
  Loader,
  ArrowLeft,
  Check,
  Plus
} from "lucide-react";
import { cn } from "../../../lib/utils";

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<ArtistTrackSortMode>("popular");
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const { playQueue } = usePlayerStore();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const artistData = await artistService.getArtistById(id);
        setArtist(artistData);

        if (artistData) {
          const tracksData = await artistService.getTracksByArtist(id, activeTab);
          setTracks(tracksData);
        }
      } catch (err) {
        console.error("Error fetching artist detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id, activeTab]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playQueue(tracks, 0);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Artist link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading artist portfolio...</p>
      </div>
    );
  }

  // Proper 404 / Not Found State
  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Artist Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find the artist you are looking for.
        </p>
        <button
          onClick={() => router.push("/artists")}
          className="px-5 py-2 bg-[#365377] text-white font-semibold text-xs rounded-md hover:bg-[#2d4665] transition-colors"
        >
          View All Artists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Artist Hero Header (Matches Screenshot 4) */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
        {/* Large Round Avatar */}
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Artist Information & Actions */}
        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {artist.name}
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            {artist.trackCount || tracks.length} tracks
          </p>

          {/* Genre Tag Badge */}
          {artist.genres.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                #{artist.genres[0]}
              </span>
            </div>
          )}

          {/* Star Rating */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1 text-xs text-slate-500">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
            </div>
            <span className="font-bold text-slate-700">{artist.rating || 4.7}</span>
            <span className="text-slate-400 text-[11px]">(votes: 13,209)</span>
          </div>

          {/* Action Buttons (Matches Screenshot 4) */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-3">
            {/* Play All Yellow Button */}
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-full transition-colors shadow-xs focus:outline-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </button>

            {/* Add to Favorites */}
            <button
              onClick={() => alert(`Added ${artist.name} to favorites`)}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Add to favorites"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Follow / Verified checkmark button */}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center transition-colors focus:outline-none",
                isFollowing
                  ? "bg-[#365377] border-[#365377] text-white"
                  : "border-slate-300 hover:border-slate-400 text-slate-600"
              )}
              aria-label={isFollowing ? "Following" : "Follow"}
            >
              <Check className="w-4 h-4" />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Tabs and Sorted Tracks List (Matches Screenshot 4) */}
      <section className="space-y-4">
        {/* Tabs: POPULAR | ALPHABETICAL | BY DATE */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
          {([
            { key: "popular", label: "POPULAR" },
            { key: "alphabetical", label: "ALPHABETICAL" },
            { key: "date", label: "BY DATE" }
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative pb-2.5 transition-colors focus:outline-none",
                activeTab === tab.key
                  ? "text-amber-500 font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tracks display */}
        <TrackList tracks={tracks} fallbackText="This artist has no tracks in this category." />
      </section>
    </div>
  );
}

