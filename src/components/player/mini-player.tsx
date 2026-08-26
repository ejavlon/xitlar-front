"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/player-store";
import { useEqualizerStore } from "../../stores/equalizer-store";
import { useAudioPlayer } from "../../hooks/use-audio-player";
import { formatDuration } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
  ChevronDown,
  Maximize2,
  SlidersHorizontal
} from "lucide-react";

interface MiniPlayerProps {
  onOpenQueue?: () => void;
}

export function MiniPlayer({ onOpenQueue }: MiniPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    quality,
    togglePlay,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setQuality
  } = usePlayerStore();

  const { seekTo } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(false);
  }, [currentTrack]);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (isMuted && vol > 0) {
      toggleMute();
    }
  };

  return (
    <>
      {/* 1. COLLAPSED MINI PLAYER (Visible on mobile/tablet < 1024px) */}
      <div
        onClick={() => setExpanded(true)}
        className="lg:hidden fixed bottom-14 left-2 right-2 h-14 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between select-none z-45 shadow-lg cursor-pointer"
      >
        {/* Track info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {currentTrack.artist.name}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {currentTrack.title}
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              "p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none",
              isLiked ? "text-red-500" : "text-slate-400 hover:text-slate-700"
            )}
            aria-label={isLiked ? "Unlike track" : "Like track"}
          >
            <Heart className={cn("w-4 h-4", isLiked ? "fill-current text-red-500" : "")} />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[#365377] text-white flex items-center justify-center shadow-xs focus:outline-none"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setExpanded(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 focus:outline-none"
            aria-label="Expand player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mini progress bar on bottom edge */}
        <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. EXPANDED FULL-SCREEN MOBILE PLAYER */}
      {expanded && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col p-6 overflow-y-auto animate-fade-in text-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button
              onClick={() => setExpanded(false)}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 focus:outline-none"
              aria-label="Collapse player"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Now Playing
              </span>
              <p className="text-xs font-semibold text-slate-700">{currentTrack.album?.title || "Xitlar Stream"}</p>
            </div>
            <button
              onClick={() => setQuality(quality === "MQ" ? "HQ" : "MQ")}
              className="px-2.5 py-1 text-xs font-bold text-[#365377] border border-slate-200 rounded-md focus:outline-none"
            >
              {quality}
            </button>
          </div>

          {/* Large Artwork */}
          <div className="flex-1 flex items-center justify-center my-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Track Info & Like */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {currentTrack.artist.name}
              </h2>
              <p className="text-sm text-slate-500 truncate mt-0.5">
                {currentTrack.title}
              </p>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "p-2.5 rounded-full bg-slate-100 border border-slate-200 focus:outline-none",
                isLiked ? "text-red-500" : "text-slate-400"
              )}
              aria-label="Like"
            >
              <Heart className={cn("w-5 h-5", isLiked ? "fill-current text-red-500" : "")} />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="space-y-2 mb-6">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={toggleShuffle}
              className={cn(
                "p-3 text-slate-400 hover:text-slate-800 focus:outline-none",
                isShuffled && "text-amber-500 font-bold"
              )}
              aria-label="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={previous}
              className="p-3 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Previous track"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#365377] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="p-3 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Next track"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={cn(
                "p-3 text-slate-400 hover:text-slate-800 focus:outline-none relative",
                repeatMode !== "off" && "text-amber-500 font-bold"
              )}
              aria-label={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-5 h-5" />
              {repeatMode === "one" && (
                <span className="absolute top-2 right-2 bg-amber-500 text-[8px] font-bold text-white px-1 rounded-full">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Volume and Queue Bar */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={toggleMute}
                className="text-slate-400 focus:outline-none"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-slate-200 rounded-full appearance-none accent-amber-500"
              />
            </div>

            {/* Equalizer Toggle Button */}
            <button
              onClick={() => {
                setExpanded(false);
                useEqualizerStore.getState().setEqualizerOpen(true);
              }}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none hover:bg-slate-100"
              aria-label="Open Equalizer"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {onOpenQueue && (
              <button
                onClick={() => {
                  setExpanded(false);
                  onOpenQueue();
                }}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none hover:bg-slate-100"
                aria-label="Toggle queue"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

