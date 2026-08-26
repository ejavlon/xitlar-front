"use client";

import Link from "next/link";
import { Artist } from "../../types/artist";
import { Play } from "lucide-react";
import { usePlayerStore } from "../../stores/player-store";
import { artistService } from "../../services/artist.service";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const { playQueue } = usePlayerStore();

  const handlePlayArtist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const tracks = await artistService.getTracksByArtist(artist.id, "popular");
      if (tracks.length > 0) {
        playQueue(tracks, 0);
      } else {
        alert("This artist doesn't have any tracks yet.");
      }
    } catch (err) {
      console.error("Failed to play artist tracks:", err);
    }
  };

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group flex flex-col items-center text-center select-none cursor-pointer p-1"
    >
      {/* Square Rounded Card Image */}
      <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-xs bg-slate-100 mb-2 border border-slate-200/80">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
          <button
            onClick={handlePlayArtist}
            className="w-10 h-10 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none"
            aria-label={`Play ${artist.name}`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Artist Name */}
      <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#365377] transition-colors truncate w-full">
        {artist.name}
      </h4>
    </Link>
  );
}

