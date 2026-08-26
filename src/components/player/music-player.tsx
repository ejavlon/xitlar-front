"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/player-store";
import { useAudioPlayer } from "../../hooks/use-audio-player";
import { usePlayerInit } from "../../hooks/use-player-init";
import { formatDuration } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import { MiniPlayer } from "./mini-player";
import { VolumePopover } from "./volume-popover";
import { EqualizerModal } from "./equalizer-modal";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  Plus,
  Download,
  Trash2,
  X,
  ChevronDown
} from "lucide-react";

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    queue,
    currentIndex,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    quality,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setQuality,
    playTrack,
    removeFromQueue,
    clearQueue
  } = usePlayerStore();

  const { seekTo } = useAudioPlayer();
  usePlayerInit();

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Sync liked state with track change
  useEffect(() => {
    setIsLiked(false);
  }, [currentTrack]);

  if (!currentTrack) {
    return (
      <div className="hidden lg:flex h-12 bg-white border-t border-slate-200 px-6 items-center justify-center select-none text-slate-400 text-xs fixed bottom-0 left-0 right-0 z-40 shadow-md">
        No track selected. Click on any song to start listening.
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  return (
    <>
      {/* MOBILE MINI PLAYER (Mobile / Tablet < 1024px) */}
      <MiniPlayer onOpenQueue={() => setQueueModalOpen(true)} />

      {/* DESKTOP PLAYER (>= 1024px) - Matches Sefon Screenshots */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 h-[var(--player-height)] bg-white border-t border-slate-200 select-none z-40 shadow-lg flex-col justify-between">
        {/* Amber/Yellow Top Progress Scrubber Bar */}
        <div className="w-full relative h-1.5 bg-slate-100 cursor-pointer group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Seek track position"
          />
          {/* Progress fill */}
          <div
            className="h-full bg-amber-400 group-hover:bg-amber-500 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Progress thumb dot on hover */}
          <div
            className="w-3 h-3 rounded-full bg-amber-500 absolute top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xs"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Player Body Bar */}
        <div className="flex-1 max-w-[1240px] w-full mx-auto px-4 flex items-center justify-between">
          {/* Left Controls: Prev, Play, Next, Queue, Repeat, Shuffle */}
          <div className="flex items-center gap-3 text-slate-600 shrink-0">
            {/* Previous */}
            <button
              onClick={previous}
              className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Previous track"
            >
              <SkipBack className="w-4.5 h-4.5 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label={isPlaying ? "Pause track" : "Play track"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Next track"
            >
              <SkipForward className="w-4.5 h-4.5 fill-current" />
            </button>

            {/* Queue / Playlist Overlay Toggle Button (Highlighted in Screenshot 5) */}
            <button
              onClick={() => setQueueModalOpen(!queueModalOpen)}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none border",
                queueModalOpen
                  ? "bg-[#365377] text-white border-[#365377]"
                  : "border-slate-300 hover:bg-slate-100 text-slate-700"
              )}
              aria-label="Open playlist queue overlay"
            >
              <ListMusic className="w-4.5 h-4.5" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={cn(
                "p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none relative",
                repeatMode !== "off" ? "text-amber-500 font-bold" : "hover:text-slate-900"
              )}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              <Repeat className="w-4.5 h-4.5" />
              {repeatMode === "one" && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-[8px] font-bold text-white leading-none px-1 rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={cn(
                "p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none",
                isShuffled ? "text-amber-500 font-bold" : "hover:text-slate-900"
              )}
              aria-label="Shuffle queue"
            >
              <Shuffle className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Center: Track Details (Artist & Title) */}
          <div className="flex-1 text-center px-4 min-w-0">
            <p className="text-xs sm:text-sm text-slate-800 font-bold truncate">
              {currentTrack.artist.name} <span className="font-normal text-slate-600">— {currentTrack.title}</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </p>
          </div>

          {/* Right Controls: Quality, Volume, Like, Plus, Download */}
          <div className="flex items-center gap-3.5 text-slate-500 shrink-0">
            {/* Audio Quality MQ / HQ */}
            <button
              onClick={() => setQuality(quality === "MQ" ? "HQ" : "MQ")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-300 transition-colors focus:outline-none"
              aria-label={`Toggle audio quality. Current: ${quality}`}
            >
              {quality}
            </button>

            {/* Volume Popover with Equalizer Trigger */}
            <VolumePopover />

            {/* Like */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "p-1 hover:text-red-500 transition-colors focus:outline-none",
                isLiked ? "text-red-500 fill-red-500" : "hover:text-slate-900"
              )}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => alert(`Added "${currentTrack.title}" to playlist`)}
              className="p-1 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Add to playlist"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={() => alert(`Downloading "${currentTrack.title}" (mock state)`)}
              className="p-1 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 10-BAND EQUALIZER PANEL (Matches Screenshot 2) */}
      <EqualizerModal />

      {/* QUEUE / PLAYLIST FULL OVERLAY MODAL (Matches Screenshot 5) */}
      {queueModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in select-none">
          {/* Overlay Header */}
          <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Trending Hits (Current Playlist)
            </h2>
            <div className="flex items-center gap-4">
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Queue</span>
                </button>
              )}
              <button
                onClick={() => setQueueModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Close Queue Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Overlay Content Area: Left Queue Tracks + Right Category Accordions */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Tracks List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
              {queue.length === 0 ? (
                <div className="py-20 text-center text-sm text-slate-400">
                  Queue is empty. Click on any track to start listening.
                </div>
              ) : (
                queue.map((track, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track)}
                      className={cn(
                        "group flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors",
                        isSelected ? "bg-amber-50/80" : ""
                      )}
                    >
                      {/* Play + Title & Artist */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <button
                          className={cn(
                            "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            isSelected && isPlaying
                              ? "bg-[#365377] border-[#365377] text-white"
                              : "border-slate-300 text-slate-600 bg-white"
                          )}
                        >
                          {isSelected && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={cn(
                              "text-xs sm:text-sm font-semibold truncate leading-tight",
                              isSelected ? "text-[#365377]" : "text-slate-900"
                            )}
                          >
                            {track.artist.name}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                            {track.title}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions + Duration */}
                      <div className="flex items-center gap-3 text-slate-400 text-xs shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(track.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity focus:outline-none"
                          aria-label="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Added "${track.title}" to playlist`);
                          }}
                          className="p-1 hover:text-slate-700 transition-colors focus:outline-none"
                          aria-label="Add to Playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-slate-400 text-xs min-w-[36px] text-right font-medium">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Category Tabs Accordion (Matches Screenshot 5) */}
            <div className="hidden md:block w-72 border-l border-slate-200 p-4 space-y-4 overflow-y-auto bg-slate-50/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 text-xs font-bold text-slate-700 cursor-pointer border-b border-slate-200 hover:text-[#365377]">
                  <span>My Playlists</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center justify-between py-2 text-xs font-bold text-slate-700 cursor-pointer border-b border-slate-200 hover:text-[#365377]">
                  <span>Artists</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center justify-between py-2 text-xs font-bold text-slate-700 cursor-pointer border-b border-slate-200 hover:text-[#365377]">
                  <span>Collections</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Bottom Scrubber info */}
          <div className="h-10 border-t border-slate-200 px-6 flex items-center justify-between bg-white text-[11px] text-slate-400 shrink-0">
            <span>{formatDuration(currentTime)}</span>
            <span>{currentTrack.artist.name} — {currentTrack.title}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      )}
    </>
  );
}

