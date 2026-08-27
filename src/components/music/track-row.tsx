"use client";

import Link from "next/link";
import { Track } from "../../types/track";
import { usePlayerStore } from "../../stores/player-store";
import { formatDuration, formatReleaseDate, formatNumber } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import { Play, Pause, Heart, Plus, Download, HeartCrack } from "lucide-react";
import { useState } from "react";
import { AddToPlaylistPopover } from "../player/add-to-playlist-popover";

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
      className="group flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer select-none border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
    >
      {/* Left side: Play button + Title/Artist */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        {/* Circular Play / Pause Icon Button (32x32) */}
        <button
          onClick={handlePlayClick}
          className={cn(
            "w-8 h-8 rounded-full border bg-white flex items-center justify-center shrink-0 transition-colors focus:outline-none",
            isCurrent && isPlaying
              ? "border-[#456690] text-[#456690]"
              : isCurrent
              ? "border-[#456690] text-[#456690]"
              : "border-slate-300 text-slate-500 group-hover:border-[#456690] group-hover:text-[#456690]"
          )}
          aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Artist Name & Track Title */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/artists/${track.artist.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs sm:text-[13px] font-bold text-slate-900 truncate leading-tight block hover:underline hover:text-[#456690] transition-colors cursor-pointer w-fit max-w-full"
          >
            {track.artist.name}
          </Link>
          <Link
            href={`/artists/${track.artist.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] sm:text-[12px] text-slate-500 truncate mt-0.5 block hover:underline hover:text-[#456690] transition-colors cursor-pointer w-fit max-w-full"
          >
            {track.title}
          </Link>
        </div>
      </div>

      {/* Right side: Normal vs Hover State */}
      <div className="flex items-center shrink-0">
        {variant === "compact" ? (
          <div className="w-10 flex items-center justify-end">
            {/* COMPACT HOVER: Shows only Download icon */}
            <button
              type="button"
              onClick={handleDownloadClick}
              className="hidden group-hover:flex w-7 h-7 rounded-full border border-transparent hover:border-[#456690] text-[#456690] hover:bg-white transition-all items-center justify-center focus:outline-none"
              aria-label="Download"
            >
              <Download className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* COMPACT NON-HOVER: Shows only Duration */}
            <span className="flex group-hover:hidden text-xs font-normal text-slate-400 font-mono">
              {formatDuration(track.duration, true)}
            </span>
          </div>
        ) : (
          <>
            {/* HOVER METADATA: Date, Likes, Dislikes (Fades in smoothly without shifting layout) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-3 sm:gap-4 text-slate-400 mr-2.5 sm:mr-3 pointer-events-none group-hover:pointer-events-auto">
              {/* Release Date */}
              <span className="hidden md:inline text-xs text-slate-400 font-normal whitespace-nowrap">
                {formatReleaseDate(track.releaseDate || "2026-06-17")}
              </span>

              {/* Likes */}
              <button
                type="button"
                onClick={handleLikeClick}
                className="flex items-center gap-1.5 hover:text-red-500 transition-colors focus:outline-none"
                aria-label="Like"
              >
                <Heart className={cn("w-3.5 h-3.5 stroke-[1.5]", isLiked ? "fill-red-500 text-red-500 stroke-red-500" : "text-slate-400")} />
                <span className="text-xs font-normal text-slate-400">{formatNumber(likesCount)}</span>
              </button>

              {/* Dislikes */}
              <button
                type="button"
                onClick={handleDislikeClick}
                className="hidden sm:flex items-center gap-1.5 hover:text-red-500 transition-colors focus:outline-none"
                aria-label="Dislike"
              >
                <HeartCrack
                  className={cn(
                    "w-3.5 h-3.5 stroke-[1.5] transition-colors",
                    isDisliked ? "text-red-500 stroke-red-500 stroke-[2]" : "text-slate-400 hover:text-red-400"
                  )}
                />
                <span className={cn("text-xs font-normal transition-colors", isDisliked ? "text-red-500" : "text-slate-400")}>
                  {formatNumber(dislikesCount)}
                </span>
              </button>
            </div>

            {/* FIXED RIGHT ACTIONS: Add to playlist (+) & Duration/Download */}
            <div className="flex items-center gap-2 sm:gap-2.5 text-slate-400 shrink-0">
              {/* Add to Playlist (+) */}
              <div onClick={(e) => e.stopPropagation()}>
                <AddToPlaylistPopover track={track} position="bottom" triggerSize="sm" />
              </div>

              {/* Fixed width slot for Duration / Download */}
              <div className="w-10 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  className="hidden group-hover:flex w-7 h-7 rounded-full border border-transparent hover:border-[#456690] text-[#456690] hover:bg-white transition-all items-center justify-center focus:outline-none"
                  aria-label="Download"
                >
                  <Download className="w-4 h-4 stroke-[1.75]" />
                </button>
                <span className="flex group-hover:hidden text-xs font-medium text-slate-400 font-mono text-right">
                  {formatDuration(track.duration, true)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

