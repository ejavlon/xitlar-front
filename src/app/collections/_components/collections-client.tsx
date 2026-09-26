"use client";

import { useState, useMemo } from "react";
import { Playlist } from "../../../types/playlist";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { cn } from "../../../lib/utils";
import { Library, Tag } from "lucide-react";

interface CollectionsClientProps {
  initialCollections: Playlist[];
}

export function CollectionsClient({ initialCollections }: CollectionsClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Barcha unique taglarni chiqaramiz
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialCollections.forEach((c) => {
      if (c.tagName) tagSet.add(c.tagName);
    });
    return Array.from(tagSet).sort();
  }, [initialCollections]);

  const filtered = useMemo(() => {
    if (!activeTag) return initialCollections;
    return initialCollections.filter((c) => c.tagName === activeTag);
  }, [initialCollections, activeTag]);

  return (
    <>
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-[#365377]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Music Collections
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-7">
            Admin tomonidan tuzilgan temalashtirilgan musiqa to'plamlari
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start mt-1">
          {initialCollections.length} ta to'plam
        </span>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all border",
              !activeTag
                ? "bg-[#365377] border-[#365377] text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            Barchasi
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all border",
                activeTag === tag
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
              )}
            >
              <Tag className="w-2.5 h-2.5" />
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Collections Grid */}
      <PlaylistGrid
        playlists={filtered}
        fallbackText={
          activeTag
            ? `#${activeTag} tegidagi kolleksiyalar topilmadi.`
            : "Hozircha hech qanday kolleksiya mavjud emas."
        }
      />
    </>
  );
}
