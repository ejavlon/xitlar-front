"use client";

import { Playlist } from "../../../types/playlist";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { ListMusic } from "lucide-react";

interface PlaylistsClientProps {
  initialPlaylists: Playlist[];
}

export function PlaylistsClient({ initialPlaylists }: PlaylistsClientProps) {
  return (
    <>
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-[#365377]" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Playlists
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 ml-7">
          Foydalanuvchilar tomonidan yaratilgan shaxsiy musiqa ro&apos;yxatlari
        </p>
      </div>

      {/* Playlist Grid */}
      <PlaylistGrid
        playlists={initialPlaylists}
        fallbackText="Hozircha hech qanday playlist mavjud emas."
      />
    </>
  );
}
