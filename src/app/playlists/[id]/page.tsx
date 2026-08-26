"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playlist } from "../../../types/playlist";
import { musicService } from "../../../services/music.service";
import { usePlayerStore } from "../../../stores/player-store";
import { TrackList } from "../../../components/music/track-list";
import { formatDuration } from "../../../lib/formatters";
import { cn } from "../../../lib/utils";
import { ArrowLeft, Loader, Play, Clock, Heart } from "lucide-react";

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const { playQueue } = usePlayerStore();

  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await musicService.getPlaylistById(id);
        setPlaylist(data);
      } catch (err) {
        console.error("Error fetching playlist detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id]);

  const handlePlayAll = () => {
    if (playlist && playlist.tracks && playlist.tracks.length > 0) {
      playQueue(playlist.tracks, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening compilation archive...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Playlist Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find the playlist you are looking for.
        </p>
        <button
          onClick={() => router.push("/collections")}
          className="px-5 py-2 bg-[#365377] text-white font-semibold text-xs rounded-md hover:bg-[#2d4665] transition-colors"
        >
          View Collections
        </button>
      </div>
    );
  }

  const totalDuration = playlist.tracks?.reduce((acc, track) => acc + track.duration, 0) || 0;

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

      {/* Playlist Hero Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
        {/* Cover art image */}
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-xs shrink-0 bg-slate-100 border border-slate-200 relative group">
          <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <button
              onClick={handlePlayAll}
              className="w-11 h-11 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none"
              aria-label="Play all tracks"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Playlist metadata details */}
        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded inline-block">
            {playlist.isCollection ? "Featured Collection" : "User Playlist"}
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {playlist.title}
          </h1>

          <p className="text-xs text-slate-500 line-clamp-2">
            {playlist.description || "Collection of top hits."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-700">By {playlist.creator || "Xitlar"}</span>
            <span>&bull;</span>
            <span>{playlist.trackCount} tracks</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalDuration)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-full transition-colors shadow-xs focus:outline-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 border text-xs font-semibold rounded-full transition-colors focus:outline-none",
                isLiked
                  ? "border-[#365377] text-[#365377] bg-slate-50"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-current text-[#365377]" : "")} />
              <span>{isLiked ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tracks list */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Tracklist</h2>
        <TrackList tracks={playlist.tracks || []} fallbackText="This playlist is empty." />
      </section>
    </div>
  );
}

