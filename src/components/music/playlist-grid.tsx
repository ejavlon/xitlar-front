import { Playlist } from "../../types/playlist";
import { PlaylistCard } from "./playlist-card";

interface PlaylistGridProps {
  playlists: Playlist[];
  fallbackText?: string;
}

export function PlaylistGrid({ playlists, fallbackText = "No playlists found" }: PlaylistGridProps) {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg bg-slate-50 border border-slate-200/60 w-full">
        <p className="text-slate-500 text-xs sm:text-sm">{fallbackText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 w-full">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

