"use client";

import Link from "next/link";
import { Track } from "../../types/track";
import { usePlayerStore } from "../../stores/player-store";
import { formatDuration, formatReleaseDate, formatNumber } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import { Play, Pause, Heart, Plus, Download, HeartCrack } from "lucide-react";
import { useState } from "react";

interface TrackRowProps {
  track: Track;
  index?: number;
  playlistTracks?: Track[]; // context queue to register when playing
  variant?: "default" | "compact";
}

export function TrackRow({ track, playlistTracks, variant = "default" }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(track.likesCount || 0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikesCount, setDislikesCount] = useState(track.dislikesCount || 203);

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
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisliked) {
      setIsDisliked(false);
      setDislikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsDisliked(true);
      setDislikesCount((prev) => prev + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
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
          <Link
            href={`/artists/${track.artist.id}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "text-xs sm:text-sm font-semibold truncate leading-tight block hover:underline hover:text-[#365377] transition-colors cursor-pointer w-fit max-w-full",
              isCurrent ? "text-[#365377]" : "text-slate-900"
            )}
          >
            {track.artist.name}
          </Link>
          <Link
            href={`/artists/${track.artist.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5 block hover:underline hover:text-[#365377] transition-colors cursor-pointer w-fit max-w-full"
          >
            {track.title}
          </Link>
        </div>
      </div>

      {/* Right side: Normal vs Hover State */}
      <div className="flex items-center shrink-0">
        {variant === "compact" ? (
          <>
            {/* COMPACT HOVER: Shows only Download icon (Matching Screenshot) */}
            <div className="hidden group-hover:flex items-center text-slate-400 animate-fade-in">
              <button
                onClick={handleDownloadClick}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                aria-label="Download"
              >
                <Download className="w-[20px] h-[20px] stroke-[1.75]" />
              </button>
            </div>

            {/* COMPACT NON-HOVER: Shows only Duration (Matching Screenshot) */}
            <div className="flex group-hover:hidden items-center text-slate-400">
              <span className="text-[13px] font-normal text-slate-400 min-w-[36px] text-right">
                {formatDuration(track.duration, true)}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* FULL HOVER ACTIONS (Appears when mouse hovers) */}
            <div className="hidden group-hover:flex items-center gap-5 sm:gap-7 text-slate-400 animate-fade-in">
              {/* Release Date */}
              <span className="hidden md:inline text-[14px] text-slate-400 font-normal">
                {formatReleaseDate(track.releaseDate || "2026-06-17")}
              </span>

              {/* Likes */}
              <button
                onClick={handleLikeClick}
                className="flex items-center gap-2 hover:text-red-500 transition-colors focus:outline-none"
                aria-label="Like"
              >
                <Heart className={cn("w-[22px] h-[22px] stroke-[1.5]", isLiked ? "fill-red-500 text-red-500 stroke-red-500" : "text-slate-400")} />
                <span className="text-[14px] font-normal text-slate-400">{formatNumber(likesCount)}</span>
              </button>

              {/* Dislikes (Broken Heart / HeartCrack - Red stroke/border on active) */}
              <button
                onClick={handleDislikeClick}
                className="hidden sm:flex items-center gap-2 hover:text-red-500 transition-colors focus:outline-none"
                aria-label="Dislike"
              >
                <HeartCrack
                  className={cn(
                    "w-[22px] h-[22px] stroke-[1.5] transition-colors",
                    isDisliked
                      ? "text-red-500 stroke-red-500 stroke-[2]"
                      : "text-slate-400 hover:text-red-400"
                  )}
                />
                <span
                  className={cn(
                    "text-[14px] font-normal transition-colors",
                    isDisliked ? "text-red-500" : "text-slate-400"
                  )}
                >
                  {formatNumber(dislikesCount)}
                </span>
              </button>

              {/* Add to Queue/Playlist */}
              <button
                onClick={handleAddClick}
                className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                aria-label="Add to Queue"
              >
                <Plus className="w-[22px] h-[22px] stroke-[1.75]" />
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadClick}
                className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                aria-label="Download"
              >
                <Download className="w-[22px] h-[22px] stroke-[1.75]" />
              </button>
            </div>

            {/* FULL NON-HOVER STATE (Shows + and duration) */}
            <div className="flex group-hover:hidden items-center gap-4 text-slate-400">
              <button
                onClick={handleAddClick}
                className="p-0.5 hover:text-slate-700 transition-colors focus:outline-none"
                aria-label="Add to Queue"
              >
                <Plus className="w-[22px] h-[22px] stroke-[1.75] text-slate-400" />
              </button>
              <span className="text-[14px] font-medium text-slate-400 min-w-[38px] text-right">
                {formatDuration(track.duration)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

