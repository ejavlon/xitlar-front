"use client";

import Link from "next/link";
import { Artist } from "../../types/artist";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group flex flex-col items-center text-center select-none cursor-pointer w-full"
    >
      {/* Square Rounded Card Image */}
      <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-xs bg-slate-100 mb-2 border border-slate-200/80">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-95"
          loading="lazy"
        />
      </div>

      {/* Artist Name */}
      <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-[#365377] transition-colors truncate w-full text-center">
        {artist.name}
      </h4>
    </Link>
  );
}

