"use client";

import Link from "next/link";
import { Playlist } from "../../types/playlist";

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group flex flex-col items-center text-center select-none cursor-pointer w-full"
    >
      {/* Square Rounded Card Image */}
      <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-xs bg-slate-100 mb-2 border border-slate-200/80">
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-95"
          loading="lazy"
        />
      </div>

      {/* Title */}
      <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-[#365377] transition-colors truncate w-full text-center">
        {playlist.title}
      </h4>
    </Link>
  );
}

