"use client";

import { Track } from "../../types/track";
import { usePlayerStore } from "../../stores/player-store";
import { formatDuration, formatReleaseDate, formatNumber } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import { Play, Pause, Heart, Plus, Download, ThumbsDown } from "lucide-react";
import { useState } from "react";

interface TrackRowProps {
  track: Track;
  index?: number;
  playlistTracks?: Track[]; // context queue to register when playing
}

export function TrackRow({ track, playlistTracks }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(track.likesCount || 0);

  const isCurrent = currentTrack?.id === track.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, playlistTracks || [track]);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(likesCount - 1);
    } else {
      setIsLiked(true);
      setLikesCount(likesCount + 1);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    usePlayerStore.getState().addToQueue(track);
    alert(`Added "${track.title}" to queue`);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Downloading "${track.title}" (mock state)`);
  };

  return (
    <div
      onClick={handlePlayClick}
      className={cn(
        "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer select-none border-b border-slate-100 last:border-b-0 hover:bg-slate-50",
        isCurrent ? "bg-amber-50/70" : ""
      )}
    >
      {/* Left side: Play button + Title/Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        {/* Circular Play / Pause Icon Button (40x40) */}
        <button
          onClick={handlePlayClick}
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors focus:outline-none",
            isCurrent && isPlaying
              ? "bg-[#365377] border-[#365377] text-white"
              : isCurrent
              ? "bg-[#365377] border-[#365377] text-white"
              : "border-slate-300 text-slate-600 group-hover:border-[#365377] group-hover:text-[#365377] bg-white"
          )}
          aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Artist Name & Track Title */}
        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              "text-xs sm:text-sm font-semibold truncate leading-tight",
              isCurrent ? "text-[#365377]" : "text-slate-900"
            )}
          >
            {track.artist.name}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5 group-hover:text-slate-600">
            {track.title}
          </p>
        </div>
      </div>

      {/* Right side: Normal vs Hover State */}
      <div className="flex items-center shrink-0">
        {/* HOVER ACTIONS (Appears when mouse hovers - Matching Screenshot 3) */}
        <div className="hidden group-hover:flex items-center gap-3 sm:gap-4 text-slate-500 animate-fade-in text-xs">
          {/* Release Date */}
          <span className="hidden md:inline text-[11px] text-slate-400 font-medium">
            {formatReleaseDate(track.releaseDate || "2026-06-17")}
          </span>

          {/* Likes */}
          <button
            onClick={handleLikeClick}
            className="flex items-center gap-1 hover:text-red-500 transition-colors focus:outline-none"
            aria-label="Like"
          >
            <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-red-500 text-red-500" : "")} />
            <span className="text-[11px] font-medium">{formatNumber(likesCount)}</span>
          </button>

          {/* Dislikes / Plays */}
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">{formatNumber(track.dislikesCount || 120)}</span>
          </div>

          {/* Add to Queue/Playlist */}
          <button
            onClick={handleAddClick}
            className="p-1 hover:text-[#365377] transition-colors focus:outline-none"
            aria-label="Add to Queue"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadClick}
            className="p-1 hover:text-[#365377] transition-colors focus:outline-none"
            aria-label="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* DEFAULT NON-HOVER STATE (Shows + and duration - Matching Screenshot 1 & 3) */}
        <div className="flex group-hover:hidden items-center gap-3 text-slate-400 text-xs">
          <button
            onClick={handleAddClick}
            className="p-1 hover:text-slate-700 transition-colors focus:outline-none"
            aria-label="Add to Queue"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400 min-w-[36px] text-right">
            {formatDuration(track.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

