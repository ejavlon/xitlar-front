"use client";

import { useEffect, useState } from "react";
import { Artist } from "../../types/artist";
import { Genre } from "../../types/genre";
import { artistService } from "../../services/artist.service";
import { musicService } from "../../services/music.service";
import { ArtistGrid } from "../../components/music/artist-grid";
import { Search, Loader } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [artistsData, genresData] = await Promise.all([
          artistService.getArtists(),
          musicService.getGenres()
        ]);
        setArtists(artistsData);
        setGenres(genresData);
      } catch (err) {
        console.error("Error loading artists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenre === "all" || artist.genres.includes(selectedGenre);

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            All Artists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover popular artists and performers
          </p>
        </div>

        {/* Search within artists */}
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
        {genres.map((g) => (
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

      {/* Loading Skeleton / Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader className="w-6 h-6 text-[#365377] animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading artists...</p>
        </div>
      ) : (
        <ArtistGrid
          artists={filteredArtists}
          fallbackText={
            searchQuery || selectedGenre !== "all"
              ? "No artists matched your filter criteria."
              : "No artists found in the library."
          }
        />
      )}
    </div>
  );
}

