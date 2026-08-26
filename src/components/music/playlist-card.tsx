"use client";

import Link from "next/link";
import { Playlist } from "../../types/playlist";
import { Play } from "lucide-react";
import { usePlayerStore } from "../../stores/player-store";

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const { playQueue } = usePlayerStore();

  const handlePlayPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (playlist.tracks && playlist.tracks.length > 0) {
      playQueue(playlist.tracks, 0);
    } else {
      alert("This playlist has no tracks to play.");
    }
  };

  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group flex flex-col select-none cursor-pointer p-1"
    >
      {/* Cover Artwork Container */}
      <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-xs bg-slate-100 mb-2 border border-slate-200/80">
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover play button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
          <button
            onClick={handlePlayPlaylist}
            className="w-10 h-10 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none"
            aria-label={`Play ${playlist.title}`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Title and details */}
      <div className="w-full min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#365377] transition-colors truncate">
          {playlist.title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          {playlist.trackCount} tracks
        </p>
      </div>
    </Link>
  );
}

