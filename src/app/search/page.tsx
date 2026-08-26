"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Track } from "../../types/track";
import { Artist } from "../../types/artist";
import { Playlist } from "../../types/playlist";
import { musicService } from "../../services/music.service";
import { artistService } from "../../services/artist.service";
import { TrackList } from "../../components/music/track-list";
import { ArtistGrid } from "../../components/music/artist-grid";
import { PlaylistGrid } from "../../components/music/playlist-grid";
import { Search, X, Loader } from "lucide-react";
import { cn } from "../../lib/utils";

type SearchFilter = "all" | "tracks" | "artists" | "playlists";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(query);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with URL changes
  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Fetch search results on query
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setTracks([]);
        setArtists([]);
        setPlaylists([]);
        return;
      }

      try {
        setLoading(true);

        const [tracksData, artistsData, playlistsData] = await Promise.all([
          musicService.searchTracks(query),
          artistService.searchArtists(query),
          musicService.getPlaylists()
        ]);

        setTracks(tracksData);
        setArtists(artistsData);

        const filteredPlaylists = playlistsData.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
        );
        setPlaylists(filteredPlaylists);
      } catch (err) {
        console.error("Error searching contents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Debounced search trigger when user types
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputVal.trim() !== query.trim()) {
        if (inputVal.trim()) {
          router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
        } else if (inputVal === "" && query !== "") {
          router.push("/search");
        }
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [inputVal, query, router]);

  const handleClear = () => {
    setInputVal("");
    router.push("/search");
    inputRef.current?.focus();
  };

  const hasResults = tracks.length > 0 || artists.length > 0 || playlists.length > 0;

  return (
    <div className="space-y-6 select-none">
      {/* Search Header for Mobile/Standalone */}
      <div className="space-y-3 pb-3 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Search</h1>
        
        {/* Search Bar Input */}
        <div className="relative w-full max-w-xl flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tracks, artists, playlists..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-l-md pl-4 pr-10 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 transition-colors"
          />
          {inputVal && (
            <button
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-700 absolute right-12 transition-colors focus:outline-none"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              if (inputVal.trim()) {
                router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
              }
            }}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2.5 rounded-r-md transition-colors flex items-center justify-center shrink-0 shadow-xs focus:outline-none"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Filter Badges */}
        {query.trim() && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(["all", "tracks", "artists", "playlists"] as SearchFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border",
                  activeFilter === filter
                    ? "bg-[#365377] border-[#365377] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader className="w-6 h-6 text-[#365377] animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Searching matching hits...</p>
        </div>
      ) : (
        <>
          {/* Default Empty state (No query) */}
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none">
              <p className="text-xs text-slate-500 max-w-sm">
                Type the name of a song, artist, or playlist to search our music catalog.
              </p>
            </div>
          )}

          {/* No results state */}
          {query.trim() && !hasResults && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none">
              <h3 className="text-base font-bold text-slate-800 mb-1">No matches found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                We couldn&apos;t find any results for &ldquo;{query}&rdquo;. Try checking spelling or searching another artist.
              </p>
            </div>
          )}

          {/* Results displaying */}
          {query.trim() && hasResults && (
            <div className="space-y-6">
              {/* Tracks Section */}
              {tracks.length > 0 && (activeFilter === "all" || activeFilter === "tracks") && (
                <section className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-800">Tracks</h2>
                  <TrackList tracks={tracks} />
                </section>
              )}

              {/* Artists Section */}
              {artists.length > 0 && (activeFilter === "all" || activeFilter === "artists") && (
                <section className="space-y-3 pt-4 border-t border-slate-100">
                  <h2 className="text-sm font-bold text-slate-800">Artists</h2>
                  <ArtistGrid artists={artists} />
                </section>
              )}

              {/* Playlists Section */}
              {playlists.length > 0 && (activeFilter === "all" || activeFilter === "playlists") && (
                <section className="space-y-3 pt-4 border-t border-slate-100">
                  <h2 className="text-sm font-bold text-slate-800">Playlists & Collections</h2>
                  <PlaylistGrid playlists={playlists} />
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader className="w-6 h-6 text-[#365377] animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading search...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

