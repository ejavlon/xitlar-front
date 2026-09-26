"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import { Playlist } from "../../types/playlist";
import { collectionService } from "../../services/collection.service";
import { useAuthStore } from "../../stores/auth-store";
import { Bookmark, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard = memo(function PlaylistCard({ playlist }: PlaylistCardProps) {
  const user = useAuthStore((s) => s.user);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user?.username && playlist?.isCollection) {
      setIsSaved(collectionService.isCollectionSaved(playlist.id, user.username));
    }
  }, [user, playlist]);

  useEffect(() => {
    const handleSavedChange = () => {
      if (user?.username && playlist?.isCollection) {
        setIsSaved(collectionService.isCollectionSaved(playlist.id, user.username));
      }
    };
    window.addEventListener("xitlar:saved-collections-changed", handleSavedChange);
    return () => {
      window.removeEventListener("xitlar:saved-collections-changed", handleSavedChange);
    };
  }, [user, playlist]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Iltimos, to'plamni saqlash uchun avval profilingizga kiring.");
      return;
    }
    const nextSaved = collectionService.toggleSaveCollection(playlist, user.username);
    setIsSaved(nextSaved);
  };

  const handleTagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.tagName) {
      window.location.href = `/collections/${encodeURIComponent(playlist.tagName)}`;
    }
  };

  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group flex flex-col items-center text-center select-none cursor-pointer w-full relative"
    >
      {/* Square Rounded Card Image */}
      <div className="w-full aspect-square rounded-lg overflow-hidden relative shadow-xs bg-slate-100 mb-1.5 border border-slate-200/80">
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-95"
          loading="lazy"
        />

        {/* Quick Save Bookmark button for collections */}
        {playlist.isCollection && (
          <button
            type="button"
            onClick={handleToggleSave}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full shadow-md transition-all focus:outline-none cursor-pointer",
              isSaved
                ? "bg-[#365377] text-white opacity-100"
                : "bg-white/90 text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100"
            )}
            title={isSaved ? "Saved to your collections" : "Save collection to profile"}
            aria-label={isSaved ? "Saved to your collections" : "Save collection to profile"}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className="text-[12px] font-bold text-slate-800 group-hover:text-[#365377] transition-colors truncate w-full text-center">
        {playlist.title}
      </h4>

      {/* Tag - clickable for collections, plain for playlists */}
      {playlist.isCollection && playlist.tagName ? (
        <span
          onClick={handleTagClick}
          className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 hover:underline transition-colors mt-0.5 truncate max-w-full cursor-pointer"
          title={`#${playlist.tagName} kolleksiyalarini ko'rish`}
        >
          #{playlist.tagName}
        </span>
      ) : playlist.tagName ? (
        <span className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate max-w-full">
          #{playlist.tagName}
        </span>
      ) : null}
    </Link>
  );
});
