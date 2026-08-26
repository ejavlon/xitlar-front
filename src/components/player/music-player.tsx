"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/player-store";
import { useAudioPlayer } from "../../hooks/use-audio-player";
import { usePlayerInit } from "../../hooks/use-player-init";
import { formatDuration, formatNumber, formatReleaseDate } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import { MiniPlayer } from "./mini-player";
import { VolumePopover } from "./volume-popover";
import { EqualizerModal } from "./equalizer-modal";
import { mockPlaylists } from "../../mock/playlists";
import { mockArtists } from "../../mock/artists";
import { mockTracks } from "../../mock/tracks";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  List,
  Heart,
  HeartCrack,
  Plus,
  Download,
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
    playQueue
  } = usePlayerStore();

  const { seekTo } = useAudioPlayer();
  usePlayerInit();

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<Record<string, boolean>>({});
  const [dislikedTrackIds, setDislikedTrackIds] = useState<Record<string, boolean>>({});

  // Sync liked state with track change
  useEffect(() => {
    setIsLiked(false);
  }, [currentTrack]);

  const toggleTrackLike = (trackId: string) => {
    setLikedTrackIds(prev => ({ ...prev, [trackId]: !prev[trackId] }));
    if (dislikedTrackIds[trackId]) {
      setDislikedTrackIds(prev => ({ ...prev, [trackId]: false }));
    }
  };

  const toggleTrackDislike = (trackId: string) => {
    setDislikedTrackIds(prev => ({ ...prev, [trackId]: !prev[trackId] }));
    if (likedTrackIds[trackId]) {
      setLikedTrackIds(prev => ({ ...prev, [trackId]: false }));
    }
  };

  if (!currentTrack) {
    return (
      <div className="hidden lg:flex fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1300px] h-14 bg-white border-t border-slate-200 px-6 items-center justify-center select-none text-slate-400 text-xs z-50 shadow-md">
        No track selected. Click on any song to start listening.
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <>
      {/* MOBILE MINI PLAYER (Mobile / Tablet < 1024px) */}
      <MiniPlayer onOpenQueue={() => setQueueModalOpen(true)} />

      {/* DESKTOP PLAYER (>= 1024px) - Matches Sefon Design */}
      <div className="hidden lg:flex fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1300px] h-16 bg-white border-t border-slate-200 select-none z-50 shadow-[0_-4px_25px_rgba(0,0,0,0.15)] flex-col justify-between px-4 sm:px-6">
        {/* Top Scrubber with Time Labels on the Left & Right (Matching Sefon Screenshot) */}
        <div className="w-full relative pt-1 flex items-center gap-3">
          {/* Current Time on Left */}
          <span className="text-[11px] text-slate-400 font-medium select-none min-w-[34px]">
            {formatDuration(currentTime, true)}
          </span>

          {/* Progress Line */}
          <div className="flex-1 relative h-1.5 bg-slate-200 rounded-full cursor-pointer group my-auto">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Seek track position"
            />
            {/* Progress fill (Amber/Yellow) */}
            <div
              className="h-full bg-amber-400 group-hover:bg-amber-500 rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Progress thumb dot on hover */}
            <div
              className="w-3 h-3 rounded-full bg-amber-500 absolute top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xs"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Total Duration on Right */}
          <span className="text-[11px] text-slate-400 font-medium select-none min-w-[34px] text-right">
            {formatDuration(duration, true)}
          </span>
        </div>

        {/* Player Body Bar: Left Controls, Center Track Info, Right Actions */}
        <div className="flex-1 w-full flex items-center justify-between pb-1">
          {/* Left Controls: Prev, Play/Pause, Next, Queue/List, Repeat, Shuffle */}
          <div className="flex items-center gap-2.5 text-slate-600 shrink-0">
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

            {/* Queue / Playlist Overlay Toggle Button (Active when open) */}
            <button
              onClick={() => setQueueModalOpen(!queueModalOpen)}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none",
                queueModalOpen
                  ? "bg-[#365377] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              aria-label="Toggle playlist queue overlay"
            >
              <List className="w-4.5 h-4.5" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={cn(
                "p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none relative",
                repeatMode !== "off" ? "text-amber-500 font-bold" : "text-slate-600 hover:text-slate-900"
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
                isShuffled ? "text-amber-500 font-bold" : "text-slate-600 hover:text-slate-900"
              )}
              aria-label="Shuffle queue"
            >
              <Shuffle className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Center: Track Details (Bold Artist & Regular Title in single line) */}
          <div className="flex-1 text-center px-4 min-w-0 flex items-center justify-center gap-1.5">
            <span className="text-xs sm:text-sm text-slate-900 font-bold truncate">
              {currentTrack.artist.name}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 font-normal truncate">
              {currentTrack.title}
            </span>
          </div>

          {/* Right Controls: Quality, Volume, Like, Plus, Download */}
          <div className="flex items-center gap-3 text-slate-500 shrink-0">
            {/* Audio Quality MQ / HQ */}
            <button
              onClick={() => setQuality(quality === "MQ" ? "HQ" : "MQ")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-1 py-0.5 transition-colors focus:outline-none uppercase"
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
                isLiked ? "text-red-500 fill-red-500" : "text-slate-500 hover:text-slate-900"
              )}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("w-4.5 h-4.5", isLiked ? "fill-current" : "")} />
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => alert(`Added "${currentTrack.title}" to playlist`)}
              className="p-1 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Add to playlist"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>

            {/* Download */}
            <button
              onClick={() => alert(`Downloading "${currentTrack.title}" (mock state)`)}
              className="p-1 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Download"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 10-BAND EQUALIZER PANEL */}
      <EqualizerModal />

      {/* QUEUE / PLAYLIST FULL OVERLAY (Positioned from Top down to Bottom Player Bar) */}
      {queueModalOpen && (
        <div className="fixed inset-y-0 bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[1300px] z-50 flex flex-col bg-white shadow-2xl border-x border-slate-200 animate-fade-in select-none">
          {/* Overlay Header: Left Title + Right Clean Close Button */}
          <div className="h-12 border-b border-slate-100 px-6 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
              Trending Hits (Current Playlist)
            </h2>
            <button
              onClick={() => setQueueModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors focus:outline-none"
              aria-label="Close Playlist View"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Overlay Content Area: Left Queue Tracks + Right Category Accordions */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Tracks List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
              {queue.length === 0 ? (
                <div className="py-20 text-center text-sm text-slate-400">
                  Queue is empty. Click on any track to start listening.
                </div>
              ) : (
                queue.map((track, idx) => {
                  const isSelected = idx === currentIndex;
                  const isTrackLiked = likedTrackIds[track.id] ?? false;
                  const isTrackDisliked = dislikedTrackIds[track.id] ?? false;
                  const displayLikes = (track.likesCount || 816) + (isTrackLiked ? 1 : 0);
                  const displayDislikes = (track.dislikesCount || 203) + (isTrackDisliked ? 1 : 0);

                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track)}
                      className="group flex items-center justify-between py-2.5 px-3 rounded hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      {/* Left: Circular Play/Pause button + Title & Artist */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              togglePlay();
                            } else {
                              playTrack(track);
                            }
                          }}
                          className={cn(
                            "w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            isSelected && isPlaying
                              ? "border-[#365377] text-[#365377] bg-white"
                              : "border-slate-300 text-slate-600 bg-white hover:border-slate-400"
                          )}
                          aria-label={isSelected && isPlaying ? "Pause" : "Play"}
                        >
                          {isSelected && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-semibold truncate leading-tight text-slate-900">
                            {track.artist.name}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                            {track.title}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions (Date + Likes + Dislikes + Plus + Download on Active/Hover) */}
                      {isSelected ? (
                        <div className="flex items-center gap-3.5 text-slate-400 text-xs shrink-0 select-none">
                          {/* Date */}
                          {track.releaseDate && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {formatReleaseDate(track.releaseDate)}
                            </span>
                          )}

                          {/* Likes */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTrackLike(track.id);
                            }}
                            className={cn(
                              "flex items-center gap-1 transition-colors focus:outline-none",
                              isTrackLiked ? "text-red-500 font-medium" : "text-slate-400 hover:text-red-500"
                            )}
                            aria-label="Like track"
                          >
                            <Heart className={cn("w-3.5 h-3.5", isTrackLiked && "fill-current")} />
                            <span className="text-[11px] font-medium">{formatNumber(displayLikes)}</span>
                          </button>

                          {/* Dislikes (Red border/color on hover and active) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTrackDislike(track.id);
                            }}
                            className={cn(
                              "flex items-center gap-1 transition-colors focus:outline-none",
                              isTrackDisliked ? "text-red-500 font-medium" : "text-slate-400 hover:text-red-500"
                            )}
                            aria-label="Dislike track"
                          >
                            <HeartCrack className={cn("w-3.5 h-3.5", isTrackDisliked ? "text-red-500" : "text-slate-400 group-hover:text-slate-500 hover:text-red-500")} />
                            <span className="text-[11px] font-medium">{formatNumber(displayDislikes)}</span>
                          </button>

                          {/* Plus */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Added "${track.title}" to playlist`);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                            aria-label="Add to Playlist"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Download */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Downloading "${track.title}" (mock)`);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                            aria-label="Download track"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400 text-xs shrink-0 select-none">
                          {/* Hover State: Date + Likes + Dislikes + Plus + Download */}
                          <div className="hidden group-hover:flex items-center gap-3.5">
                            {track.releaseDate && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                {formatReleaseDate(track.releaseDate)}
                              </span>
                            )}

                            {/* Likes */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrackLike(track.id);
                              }}
                              className={cn(
                                "flex items-center gap-1 transition-colors focus:outline-none",
                                isTrackLiked ? "text-red-500 font-medium" : "text-slate-400 hover:text-red-500"
                              )}
                              aria-label="Like track"
                            >
                              <Heart className={cn("w-3.5 h-3.5", isTrackLiked && "fill-current")} />
                              <span className="text-[11px] font-medium">{formatNumber(displayLikes)}</span>
                            </button>

                            {/* Dislikes (Red border/color on hover and active) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrackDislike(track.id);
                              }}
                              className={cn(
                                "flex items-center gap-1 transition-colors focus:outline-none",
                                isTrackDisliked ? "text-red-500 font-medium" : "text-slate-400 hover:text-red-500"
                              )}
                              aria-label="Dislike track"
                            >
                              <HeartCrack className={cn("w-3.5 h-3.5", isTrackDisliked ? "text-red-500" : "text-slate-400 hover:text-red-500")} />
                              <span className="text-[11px] font-medium">{formatNumber(displayDislikes)}</span>
                            </button>

                            {/* Plus */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Added "${track.title}" to playlist`);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                              aria-label="Add to Playlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Download */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Downloading "${track.title}" (mock)`);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                              aria-label="Download track"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Default Non-Hover State: Plus + Duration */}
                          <div className="group-hover:hidden flex items-center gap-3">
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
                              {formatDuration(track.duration, true)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Category Tabs Accordion */}
            <div className="hidden md:block w-64 border-l border-slate-100 p-4 space-y-1 overflow-y-auto bg-white">
              {/* 1. My Playlists */}
              <div className="border-b border-slate-100">
                <div
                  onClick={() => toggleAccordion("playlists")}
                  className="flex items-center justify-between py-3 text-xs font-semibold text-slate-700 cursor-pointer hover:text-[#365377] select-none"
                >
                  <span>My Playlists</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      openAccordion === "playlists" && "rotate-180"
                    )}
                  />
                </div>
                {openAccordion === "playlists" && (
                  <div className="pb-3 pl-2 space-y-1.5 animate-fade-in text-xs text-slate-600">
                    {mockPlaylists.filter(p => !p.isCollection).map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          if (pl.tracks && pl.tracks.length > 0) {
                            playQueue(pl.tracks, 0, true);
                          }
                        }}
                        className="py-1 px-2 rounded hover:bg-slate-50 cursor-pointer truncate hover:text-slate-900"
                      >
                        {pl.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Artists */}
              <div className="border-b border-slate-100">
                <div
                  onClick={() => toggleAccordion("artists")}
                  className="flex items-center justify-between py-3 text-xs font-semibold text-slate-700 cursor-pointer hover:text-[#365377] select-none"
                >
                  <span>Artists</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      openAccordion === "artists" && "rotate-180"
                    )}
                  />
                </div>
                {openAccordion === "artists" && (
                  <div className="pb-3 pl-2 space-y-1.5 animate-fade-in text-xs text-slate-600">
                    {mockArtists.slice(0, 8).map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => {
                          const artistTracks = mockTracks.filter(t => t.artist.id === artist.id);
                          if (artistTracks.length > 0) {
                            playQueue(artistTracks, 0, true);
                          }
                        }}
                        className="py-1 px-2 rounded hover:bg-slate-50 cursor-pointer truncate hover:text-slate-900"
                      >
                        {artist.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Collections */}
              <div className="border-b border-slate-100">
                <div
                  onClick={() => toggleAccordion("collections")}
                  className="flex items-center justify-between py-3 text-xs font-semibold text-slate-700 cursor-pointer hover:text-[#365377] select-none"
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      openAccordion === "collections" && "rotate-180"
                    )}
                  />
                </div>
                {openAccordion === "collections" && (
                  <div className="pb-3 pl-2 space-y-1.5 animate-fade-in text-xs text-slate-600">
                    {mockPlaylists.filter(p => p.isCollection).map((coll) => (
                      <div
                        key={coll.id}
                        onClick={() => {
                          if (coll.tracks && coll.tracks.length > 0) {
                            playQueue(coll.tracks, 0, true);
                          }
                        }}
                        className="py-1 px-2 rounded hover:bg-slate-50 cursor-pointer truncate hover:text-slate-900"
                      >
                        {coll.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

