"use client";

import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Track } from "../../types/track";
import { Artist } from "../../types/artist";
import { Playlist } from "../../types/playlist";
import { Genre } from "../../types/genre";
import { musicService } from "../../services/music.service";
import { artistService } from "../../services/artist.service";
import { TrackList } from "../../components/music/track-list";
import { ArtistGrid } from "../../components/music/artist-grid";
import { PlaylistGrid } from "../../components/music/playlist-grid";
import { usePlayerStore } from "../../stores/player-store";
import {
  Search,
  X,
  Play,
  Pause,
  Clock,
  Flame,
  Sparkles,
  Compass,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Music2,
  Users2,
  ListMusic
} from "lucide-react";
import { cn } from "../../lib/utils";
import { formatNumber } from "../../lib/formatters";

type SearchFilter = "all" | "tracks" | "artists" | "playlists";

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

  const [inputVal, setInputVal] = useState(query);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

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

  // Sync input value with URL query changes
  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Execute Search whenever URL query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setTracks([]);
      setArtists([]);
      setPlaylists([]);
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
        const [tracksData, artistsData, playlistsData] = await Promise.all([
          musicService.searchTracks(trimmed),
          artistService.searchArtists(trimmed),
          musicService.getPlaylists()
        ]);

        setTracks(tracksData);
        setArtists(artistsData);

        const filteredPlaylists = playlistsData.filter(
          (p) =>
            p.title.toLowerCase().includes(trimmed.toLowerCase()) ||
            p.description?.toLowerCase().includes(trimmed.toLowerCase())
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

  // Debounced search trigger when user types directly in page search bar
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

  const handleSelectQuery = (term: string) => {
    setInputVal(term);
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

  const totalResults = tracks.length + artists.length + playlists.length;
  const hasResults = totalResults > 0;

  // Compute "Top Result" (Best Match)
  const topResult = useMemo(() => {
    if (!query.trim() || !hasResults) return null;
    const q = query.toLowerCase().trim();

    // 1. Direct artist exact or prefix match
    const matchedArtist = artists.find(
      (a) => a.name.toLowerCase() === q || a.name.toLowerCase().startsWith(q)
    ) || artists[0];

    // 2. Direct track title match
    const matchedTrack = tracks.find(
      (t) => t.title.toLowerCase() === q || t.title.toLowerCase().startsWith(q)
    ) || tracks[0];

    // If query starts with artist name or artist matches directly, prioritize artist
    if (matchedArtist && (matchedArtist.name.toLowerCase().includes(q) || tracks.length === 0)) {
      return { type: "artist" as const, data: matchedArtist };
    }

    if (matchedTrack) {
      return { type: "track" as const, data: matchedTrack };
    }

    return null;
  }, [query, hasResults, artists, tracks]);

  // Handler to play all search tracks
  const handlePlayAllTracks = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Search Hero Header */}
      <div className="space-y-4 pb-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {query.trim() ? `Search Results for “${query}”` : "Explore & Search"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {query.trim()
                ? `Found ${totalResults} ${totalResults === 1 ? "match" : "matches"} across tracks, artists, and playlists`
                : "Discover millions of tracks, popular artists, and handpicked playlists"}
            </p>
          </div>

          {/* Action to Play All when tracks are found */}
          {query.trim() && tracks.length > 0 && (
            <button
              onClick={handlePlayAllTracks}
              className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#365377] hover:bg-[#284160] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-colors focus:outline-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All Results</span>
            </button>
          )}
        </div>

        {/* Search Bar Input - Hidden when no matches are found */}
        {!(query.trim() && !hasResults && !loading) && (
          <div className="relative w-full max-w-2xl flex items-center shadow-xs rounded-md overflow-hidden bg-white border border-slate-200 focus-within:border-[#f59e0b] focus-within:ring-1 focus-within:ring-[#f59e0b] transition-all">
            <div className="pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tracks, artists, albums, or playlists..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            {inputVal && (
              <button
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 mr-1 transition-colors focus:outline-none"
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
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2.5 transition-colors flex items-center justify-center shrink-0 font-medium text-xs sm:text-sm"
              aria-label="Search"
            >
              Search
            </button>
          </div>
        )}

        {/* Filter Badges with Result Counts */}
        {query.trim() && !loading && hasResults && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5",
                activeFilter === "all"
                  ? "bg-[#365377] border-[#365377] text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Sparkles className="w-3 h-3" />
              <span>All ({totalResults})</span>
            </button>

            {tracks.length > 0 && (
              <button
                onClick={() => setActiveFilter("tracks")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5",
                  activeFilter === "tracks"
                    ? "bg-[#365377] border-[#365377] text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Music2 className="w-3 h-3" />
                <span>Tracks ({tracks.length})</span>
              </button>
            )}

            {artists.length > 0 && (
              <button
                onClick={() => setActiveFilter("artists")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5",
                  activeFilter === "artists"
                    ? "bg-[#365377] border-[#365377] text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Users2 className="w-3 h-3" />
                <span>Artists ({artists.length})</span>
              </button>
            )}

            {playlists.length > 0 && (
              <button
                onClick={() => setActiveFilter("playlists")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5",
                  activeFilter === "playlists"
                    ? "bg-[#365377] border-[#365377] text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <ListMusic className="w-3 h-3" />
                <span>Playlists ({playlists.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-56 bg-slate-100 rounded-xl lg:col-span-1" />
            <div className="space-y-3 lg:col-span-2">
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <div className="h-6 w-32 bg-slate-100 rounded mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
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
                      onClick={handleClearRecent}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Clear history
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
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

          {/* 2. Query entered, but NO results found */}
          {query.trim() && !hasResults && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none bg-slate-50/60 rounded-2xl border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                No matches found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                We couldn&apos;t find any tracks, artists, or playlists matching your keyword. Please check for spelling errors or try searching for another term.
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

          {/* 3. Query entered & RESULTS FOUND */}
          {query.trim() && hasResults && (
            <div className="space-y-8">
              {/* TOP RESULT & TOP TRACKS (Shown on 'all' view) */}
              {activeFilter === "all" && topResult && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Top Result Card (Left Column) */}
                  <div className="lg:col-span-5 flex flex-col">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Top Result
                    </h2>

                    {topResult.type === "artist" ? (
                      <div className="relative flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/90 flex flex-col justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 shadow-md border-2 border-white bg-slate-200">
                            <img
                              src={topResult.data.avatarUrl}
                              alt={topResult.data.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#365377] text-white text-[10px] font-bold tracking-wider uppercase mb-1">
                              Artist
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                              {topResult.data.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {topResult.data.trackCount} Tracks &bull;{" "}
                              {topResult.data.genres.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                          <Link
                            href={`/artists/${topResult.data.id}`}
                            className="inline-flex items-center gap-2 bg-[#365377] hover:bg-[#284160] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-colors"
                          >
                            <span>Go to Artist</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/90 flex flex-col justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 shadow-md border border-slate-200 bg-slate-200">
                            <img
                              src={topResult.data.coverUrl}
                              alt={topResult.data.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#f59e0b] text-white text-[10px] font-bold tracking-wider uppercase mb-1">
                              Song
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                              {topResult.data.title}
                            </h3>
                            <Link
                              href={`/artists/${topResult.data.artist.id}`}
                              className="text-xs font-medium text-slate-600 hover:text-[#365377] transition-colors block truncate"
                            >
                              {topResult.data.artist.name}
                            </Link>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (currentTrack?.id === topResult.data.id) {
                                togglePlay();
                              } else {
                                playTrack(topResult.data, tracks);
                              }
                            }}
                            className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-colors"
                          >
                            {currentTrack?.id === topResult.data.id && isPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Matching Songs (Right Column) */}
                  <div className="lg:col-span-7 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Matching Songs
                      </h2>
                      {tracks.length > 4 && (
                        <button
                          onClick={() => setActiveFilter("tracks")}
                          className="text-xs text-[#365377] font-semibold hover:underline"
                        >
                          See all ({tracks.length})
                        </button>
                      )}
                    </div>

                    <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-2 shadow-xs">
                      <TrackList tracks={tracks.slice(0, 4)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Full Tracks Section */}
              {tracks.length > 0 && (activeFilter === "all" || activeFilter === "tracks") && (
                <section className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-800">
                        Tracks {activeFilter === "tracks" && `(${tracks.length})`}
                      </h2>
                    </div>
                    <button
                      onClick={handlePlayAllTracks}
                      className="text-xs text-[#365377] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play all</span>
                    </button>
                  </div>
                  <TrackList tracks={activeFilter === "all" ? tracks.slice(0, 10) : tracks} />

                  {activeFilter === "all" && tracks.length > 10 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => setActiveFilter("tracks")}
                        className="text-xs font-semibold text-[#365377] hover:underline px-4 py-2 rounded-md hover:bg-slate-50 border border-slate-200"
                      >
                        Show all {tracks.length} tracks
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Artists Section */}
              {artists.length > 0 && (activeFilter === "all" || activeFilter === "artists") && (
                <section className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800">
                      Artists {activeFilter === "artists" && `(${artists.length})`}
                    </h2>
                    {activeFilter === "all" && artists.length > 6 && (
                      <button
                        onClick={() => setActiveFilter("artists")}
                        className="text-xs text-[#365377] font-semibold hover:underline"
                      >
                        View all ({artists.length})
                      </button>
                    )}
                  </div>
                  <ArtistGrid artists={activeFilter === "all" ? artists.slice(0, 6) : artists} />
                </section>
              )}

              {/* Playlists & Collections Section */}
              {playlists.length > 0 && (activeFilter === "all" || activeFilter === "playlists") && (
                <section className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800">
                      Playlists & Collections {activeFilter === "playlists" && `(${playlists.length})`}
                    </h2>
                  </div>
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
