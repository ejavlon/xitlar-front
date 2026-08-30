"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlayerStore } from "../../stores/player-store";
import { useAudioPlayer } from "../../hooks/use-audio-player";
import { usePlayerInit } from "../../hooks/use-player-init";
import { formatDuration } from "../../lib/formatters";
import { cn } from "../../lib/utils";
import { downloadTrack } from "../../lib/download";
import { MiniPlayer } from "./mini-player";
import { VolumePopover } from "./volume-popover";
import { EqualizerModal } from "./equalizer-modal";
import { AddToPlaylistPopover } from "./add-to-playlist-popover";
import { AudioQualityPopover } from "./audio-quality-popover";
import { Playlist } from "../../types/playlist";
import { Artist } from "../../types/artist";
import { musicService } from "../../services/music.service";
import { artistService } from "../../services/artist.service";
import { TrackRow } from "../music/track-row";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  List,
  Heart,
  Plus,
  Download,
  X,
  ChevronDown
} from "lucide-react";

export function MusicPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queue = usePlayerStore((s) => s.queue);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffled = usePlayerStore((s) => s.isShuffled);
  const quality = usePlayerStore((s) => s.quality);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const setQuality = usePlayerStore((s) => s.setQuality);
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { seekTo } = useAudioPlayer();
  usePlayerInit();

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [playerPlaylists, setPlayerPlaylists] = useState<Playlist[]>([]);
  const [playerArtists, setPlayerArtists] = useState<Artist[]>([]);

  // Load playlists and artists dynamically
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const [playlistsData, artistsData] = await Promise.all([
          musicService.getPlaylists(),
          artistService.getArtists()
        ]);
        setPlayerPlaylists(playlistsData || []);
        setPlayerArtists(artistsData || []);
      } catch (err) {
        console.error("Failed to load player panel data:", err);
      }
    };
    loadPlayerData();
  }, []);

  // Sync liked state with track change
  useEffect(() => {
    setIsLiked(currentTrack?.isLiked || false);
  }, [currentTrack]);

  const handlePlayerLikeClick = async () => {
    if (!currentTrack) return;
    const oldIsLiked = isLiked;
    const nextIsLiked = !oldIsLiked;
    setIsLiked(nextIsLiked);
    try {
      const updatedTrack = await musicService.likeTrack(currentTrack.id);
      setIsLiked(updatedTrack.isLiked || false);
      usePlayerStore.getState().updateTrack(updatedTrack);
    } catch (err) {
      console.error("Failed to like track from player", err);
      setIsLiked(oldIsLiked);
    }
  };

  const hasTrack = Boolean(currentTrack);
  const progressPercent = hasTrack && duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasTrack) return;
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

      <div className="hidden lg:flex fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[66px] bg-white border-t border-slate-200 select-none z-50 shadow-[0_-4px_25px_rgba(0,0,0,0.15)] flex-col justify-between px-4 sm:px-6 py-1.5">
        <div className="w-full relative flex items-center gap-3">
          {/* Current Time on Left */}
          <span className={cn("text-[11px] font-medium select-none min-w-[32px]", hasTrack ? "text-slate-400" : "text-slate-300")}>
            {hasTrack ? formatDuration(currentTime, true) : "00:00"}
          </span>

          {/* Progress Line */}
          <div className={cn("flex-1 relative h-1.5 bg-slate-200 rounded-full my-auto", hasTrack ? "cursor-pointer group" : "opacity-60 pointer-events-none")}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={hasTrack ? currentTime : 0}
              onChange={handleProgressChange}
              disabled={!hasTrack}
              className={cn("absolute inset-0 w-full h-full opacity-0 z-10", hasTrack ? "cursor-pointer" : "cursor-not-allowed")}
              aria-label="Seek track position"
            />
            {/* Progress fill (Amber/Yellow) */}
            <div
              className="h-full bg-amber-400 group-hover:bg-amber-500 rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Progress thumb dot on hover */}
            {hasTrack && (
              <div
                className="w-3 h-3 rounded-full bg-amber-500 absolute top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xs"
                style={{ left: `${progressPercent}%` }}
              />
            )}
          </div>

          {/* Total Duration on Right */}
          <span className={cn("text-[11px] font-medium select-none min-w-[32px] text-right", hasTrack ? "text-slate-400" : "text-slate-300")}>
            {hasTrack ? formatDuration(duration, true) : "00:00"}
          </span>
        </div>

        {/* Player Body Bar: Left Controls, Center Track Info, Right Actions */}
        <div className="flex-1 w-full flex items-center justify-between pt-0.5 relative">
          {/* Left Controls: Prev, Play/Pause, Next, Queue/List, Repeat, Shuffle */}
          <div className="flex items-center gap-2.5 shrink-0 z-10">
            {/* Previous */}
            <button
              type="button"
              onClick={hasTrack ? previous : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none",
                hasTrack
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  : "text-slate-300 pointer-events-none cursor-not-allowed"
              )}
              aria-label="Previous track"
            >
              <SkipBack className="w-4.5 h-4.5 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={hasTrack ? togglePlay : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none",
                hasTrack
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  : "text-slate-300 pointer-events-none cursor-not-allowed"
              )}
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
              type="button"
              onClick={hasTrack ? next : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none",
                hasTrack
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  : "text-slate-300 pointer-events-none cursor-not-allowed"
              )}
              aria-label="Next track"
            >
              <SkipForward className="w-4.5 h-4.5 fill-current" />
            </button>

            {/* Queue / Playlist Overlay Toggle Button (Active when open) */}
            <button
              type="button"
              onClick={hasTrack ? () => setQueueModalOpen(!queueModalOpen) : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none",
                !hasTrack
                  ? "text-slate-300 pointer-events-none cursor-not-allowed"
                  : queueModalOpen
                    ? "bg-[#365377] text-white shadow-xs cursor-pointer"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              )}
              aria-label="Toggle playlist queue overlay"
            >
              <List className="w-4.5 h-4.5" />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={hasTrack ? toggleRepeat : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none relative",
                !hasTrack
                  ? "text-slate-300 pointer-events-none cursor-not-allowed"
                  : repeatMode !== "off"
                    ? "text-amber-500 font-bold hover:bg-slate-100 cursor-pointer"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              )}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              <Repeat className="w-4.5 h-4.5" />
              {repeatMode === "one" && hasTrack && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-[8px] font-bold text-white leading-none px-1 rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Shuffle */}
            <button
              type="button"
              onClick={hasTrack ? toggleShuffle : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1.5 rounded transition-colors focus:outline-none",
                !hasTrack
                  ? "text-slate-300 pointer-events-none cursor-not-allowed"
                  : isShuffled
                    ? "text-amber-500 font-bold hover:bg-slate-100 cursor-pointer"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              )}
              aria-label="Shuffle queue"
            >
              <Shuffle className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Center: Track Details (Permanently pinned at exact 50% absolute center) */}
          <div className="absolute left-1/2 -translate-x-1/2 max-w-[500px] text-center px-4 min-w-0 flex items-center justify-center gap-2 pointer-events-auto z-0">
            {hasTrack && currentTrack ? (
              <>
                <Link
                  href={`/artists/${currentTrack.artist.id}`}
                  className="text-xs sm:text-[13.5px] text-slate-900 font-bold truncate hover:underline hover:text-[#365377] transition-colors"
                >
                  {currentTrack.artist.name}
                </Link>
                <Link
                  href={`/artists/${currentTrack.artist.id}`}
                  className="text-xs sm:text-[13.5px] text-slate-500 font-normal truncate hover:underline hover:text-[#365377] transition-colors"
                >
                  {currentTrack.title}
                </Link>
              </>
            ) : null}
          </div>

          {/* Right Controls: Quality, Volume, Like, Plus, Download */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            {/* Audio Quality MQ / HQ Popover (Matches Screenshot) */}
            <AudioQualityPopover quality={quality} setQuality={setQuality} disabled={!hasTrack} />

            {/* Volume Popover with Equalizer Trigger */}
            <VolumePopover disabled={!hasTrack} />

            {/* Like */}
            <button
              type="button"
              onClick={hasTrack ? handlePlayerLikeClick : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1 transition-colors focus:outline-none",
                !hasTrack
                  ? "text-slate-300 pointer-events-none cursor-not-allowed"
                  : isLiked
                    ? "text-red-500 fill-red-500 cursor-pointer"
                    : "text-slate-500 hover:text-slate-900 cursor-pointer"
              )}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("w-4.5 h-4.5", isLiked && hasTrack ? "fill-current" : "")} />
            </button>

            {/* Add to Playlist Popover (Matches Screenshot) */}
            <AddToPlaylistPopover track={currentTrack} disabled={!hasTrack} />

            {/* Download */}
            <button
              type="button"
              onClick={hasTrack && currentTrack ? () => downloadTrack(currentTrack) : undefined}
              disabled={!hasTrack}
              className={cn(
                "p-1 transition-colors focus:outline-none",
                hasTrack ? "text-slate-500 hover:text-slate-900 cursor-pointer" : "text-slate-300 pointer-events-none cursor-not-allowed"
              )}
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
      {queueModalOpen && currentTrack && (
        <div className="fixed top-0 bottom-[66px] left-0 right-0 mx-auto w-full max-w-[1100px] z-50 flex flex-col bg-white shadow-2xl border-x border-slate-200 animate-fade-in select-none">
          <div className="h-11 border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                {currentTrack.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#365377]" />
                )}
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                {currentTrack.title} — {currentTrack.artist.name} (current playlist)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setQueueModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors focus:outline-none"
              aria-label="Close Playlist View"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Overlay Content Area: Left Queue Tracks + Right Category Accordions */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Tracks List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 divide-y divide-slate-100">
              {queue.length === 0 ? (
                <div className="py-20 text-center text-sm text-slate-400">
                  Queue is empty. Click on any track to start listening.
                </div>
              ) : (
                queue.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    playlistTracks={queue}
                  />
                ))
              )}
            </div>

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
                    {playerPlaylists.filter(p => !p.isCollection).map((pl) => (
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
                    {playerArtists.slice(0, 8).map((artist) => (
                      <div
                        key={artist.id}
                        onClick={async () => {
                          try {
                            const artistTracks = await artistService.getTracksByArtist(artist.id);
                            if (artistTracks.length > 0) {
                              playQueue(artistTracks, 0, true);
                            }
                          } catch (err) {
                            console.error("Failed to load artist tracks:", err);
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
                    {playerPlaylists.filter(p => p.isCollection).map((coll) => (
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

