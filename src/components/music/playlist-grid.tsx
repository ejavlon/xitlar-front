import Link from "next/link";
import { Playlist } from "../../types/playlist";
import { PlaylistCard } from "./playlist-card";
import { Plus } from "lucide-react";

interface PlaylistGridProps {
  playlists: Playlist[];
  fallbackText?: string;
  showCreateCard?: boolean;
}

export function PlaylistGrid({
  playlists,
  fallbackText = "No playlists found",
  showCreateCard = false
}: PlaylistGridProps) {
  if ((!playlists || playlists.length === 0) && !showCreateCard) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg bg-slate-50 border border-slate-200/60 w-full">
        <p className="text-slate-500 text-xs sm:text-sm">{fallbackText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5 w-full">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}

      {/* "+ Create Playlist" Card (Matches Screenshot 1) */}
      {showCreateCard && (
        <Link
          href="/playlists/create"
          className="group flex flex-col items-center text-center select-none cursor-pointer w-full"
        >
          <div className="w-full aspect-square rounded-lg border-2 border-dashed border-amber-300/80 bg-amber-50/40 hover:bg-amber-100/50 hover:border-amber-400 transition-all flex items-center justify-center text-slate-400 group-hover:text-[#456690] shadow-xs mb-1.5">
            <Plus className="w-9 h-9 stroke-[1.5] transition-transform group-hover:scale-110" />
          </div>
          <span className="text-[12px] font-bold text-slate-700 group-hover:text-[#456690] transition-colors">
            New playlist
          </span>
        </Link>
      )}
    </div>
  );
}

