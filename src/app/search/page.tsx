"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Track } from "../../types/track";
import { Artist } from "../../types/artist";
import { Genre } from "../../types/genre";
import { musicService } from "../../services/music.service";
import { artistService } from "../../services/artist.service";
import { TrackList } from "../../components/music/track-list";
import { ArtistGrid } from "../../components/music/artist-grid";
import {
  Search,
  Clock,
  Flame,
  Compass,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from "lucide-react";

const POPULAR_SEARCH_TAGS = [
  "Eminem",
  "Billie Eilish",
  "Dua Lipa",
  "The Weeknd",
  "Imagine Dragons",
  "Pop",
  "Rock",
  "Hip-Hop",
  "Dance & Club",
  "Relax",
  "Retro"
];

const LOCAL_STORAGE_RECENT_KEY = "xitlar_recent_searches";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches and initial discovery data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 6));
      }
    } catch {
      // Ignore localStorage errors
    }

    // Preload discovery genres and artists
    musicService.getGenres().then(setGenres).catch(console.error);
    artistService.getArtists().then((res) => setTopArtists(res.slice(0, 6))).catch(console.error);
  }, []);

  // Execute Search whenever URL query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setTracks([]);
      setLoading(false);
      return;
    }

    // Save to recent searches
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [trimmed, ...list.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
      setRecentSearches(updated.slice(0, 6));
    } catch {
      // Ignore
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const tracksData = await musicService.searchTracks(trimmed);
        setTracks(tracksData);
      } catch (err) {
        console.error("Error searching tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSelectQuery = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClearRecent = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
      setRecentSearches([]);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Search Header */}
      <div className="pb-4 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          {query.trim() ? `Search Results for “${query}”` : "Explore & Search"}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {query.trim()
            ? `Found ${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`
            : "Discover millions of tracks, popular artists, and handpicked playlists"}
        </p>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-12 bg-slate-100 rounded-lg" />
        </div>
      ) : (
        <>
          {/* 1. Empty query -> Discovery / Recommendation View */}
          {!query.trim() && (
            <div className="space-y-8">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Clear history
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        type="button"
                        key={term}
                        onClick={() => handleSelectQuery(term)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-700 font-medium transition-colors group"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending / Popular Tags */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleSelectQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs text-slate-700 hover:text-amber-700 font-medium shadow-2xs transition-all flex items-center gap-1"
                    >
                      <span>#{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explore By Genre Cards */}
              {genres.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5 text-[#365377]" />
                      <span>Browse by Genre</span>
                    </div>
                    <Link
                      href="/genres"
                      className="text-xs text-[#365377] hover:underline font-medium flex items-center gap-1"
                    >
                      <span>All genres</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {genres.slice(0, 12).map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/genres/${genre.slug}`}
                        className="group relative h-20 rounded-xl overflow-hidden p-3 flex flex-col justify-end text-white shadow-xs border border-slate-200/60 hover:shadow-md transition-all select-none"
                      >
                        <img
                          src={genre.coverUrl}
                          alt={genre.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-75 group-hover:brightness-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="relative text-xs font-bold tracking-tight drop-shadow-xs">
                          {genre.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Artists Spotlight */}
              {topArtists.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-[#365377]" />
                      <span>Top Artists</span>
                    </div>
                    <Link
                      href="/artists"
                      className="text-xs text-[#365377] hover:underline font-medium flex items-center gap-1"
                    >
                      <span>View all</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <ArtistGrid artists={topArtists} />
                </div>
              )}
            </div>
          )}

          {/* 2. Query entered, but NO tracks found */}
          {query.trim() && tracks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none bg-slate-50/60 rounded-2xl border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                No tracks found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                We couldn&apos;t find any tracks matching your keyword. Please check for spelling errors or try searching for another term.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCH_TAGS.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSelectQuery(tag)}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700 hover:text-[#365377] hover:border-[#365377] font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Query entered & TRACKS FOUND */}
          {query.trim() && tracks.length > 0 && (
            <div className="space-y-4">
              <TrackList tracks={tracks} />
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
        <div className="space-y-6 animate-pulse p-4">
          <div className="h-10 w-48 bg-slate-100 rounded" />
          <div className="h-12 w-full max-w-xl bg-slate-100 rounded-md" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
