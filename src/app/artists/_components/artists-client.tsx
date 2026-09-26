"use client";

import { useState, useMemo } from "react";
import { Artist } from "../../../types/artist";
import { Genre } from "../../../types/genre";
import { ArtistGrid } from "../../../components/music/artist-grid";
import { Search } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ArtistsClientProps {
  initialArtists: Artist[];
  initialGenres: Genre[];
}

export function ArtistsClient({ initialArtists, initialGenres }: ArtistsClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // useMemo: searchQuery yoki selectedGenre o'zgargandagina qayta hisoblaydi
  const filteredArtists = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return initialArtists.filter((artist) => {
      const matchesSearch =
        !q ||
        artist.name.toLowerCase().includes(q) ||
        artist.genres.some((g) => g.toLowerCase().includes(q));

      const matchesGenre =
        selectedGenre === "all" || artist.genres.includes(selectedGenre);

      return matchesSearch && matchesGenre;
    });
  }, [initialArtists, searchQuery, selectedGenre]);

  return (
    <>
      {/* Search within artists */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            All Artists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover popular artists and performers
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#365377] transition-colors"
          />
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedGenre("all")}
          className={cn(
            "px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border shrink-0 focus:outline-none",
            selectedGenre === "all"
              ? "bg-[#365377] border-[#365377] text-white"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          All Genres
        </button>
        {initialGenres.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.slug)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-semibold capitalize tracking-wider transition-colors border shrink-0 focus:outline-none",
              selectedGenre === g.slug
                ? "bg-[#365377] border-[#365377] text-white"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <ArtistGrid
        artists={filteredArtists}
        fallbackText={
          searchQuery || selectedGenre !== "all"
            ? "No artists matched your filter criteria."
            : "No artists found in the library."
        }
      />
    </>
  );
}
