"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Track } from "../types/track";
import { Artist } from "../types/artist";
import { Playlist } from "../types/playlist";
import { musicService } from "../services/music.service";
import { artistService } from "../services/artist.service";
import { TrackList } from "../components/music/track-list";
import { ArtistGrid } from "../components/music/artist-grid";
import { PlaylistGrid } from "../components/music/playlist-grid";

export default function HomePage() {
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tracksData, artistsData, playlistsData] = await Promise.all([
          musicService.getPopularTracks(),
          artistService.getArtists(),
          musicService.getPlaylists()
        ]);

        setPopularTracks(tracksData.slice(0, 10));
        setPopularArtists(artistsData.slice(0, 6));
        setPlaylists(playlistsData.slice(0, 6));
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Popular Artists Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2 w-[127px]">
                <div className="w-[127px] h-[127px] rounded-xl bg-slate-200" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Tracks Skeleton */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 w-full bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 1. POPULAR ARTISTS SECTION (Matches Screenshot 1) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Popular Artists
          </h2>
          <Link
            href="/artists"
            className="text-[13px] sm:text-[14px] text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <ArtistGrid artists={popularArtists} />
      </section>

      {/* 2. TRENDING HITS / POPULAR TRACKS SECTION (Matches Screenshot 1) */}
      <section className="space-y-3 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Trending Hits
          </h2>
          <Link
            href="/search"
            className="text-[13px] sm:text-[14px] text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <TrackList tracks={popularTracks} />
      </section>

      {/* 3. MUSIC COLLECTIONS / PLAYLISTS SECTION (Matches Screenshot 1) */}
      <section className="space-y-3 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Music Collections
          </h2>
          <Link
            href="/collections"
            className="text-[13px] sm:text-[14px] text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <PlaylistGrid playlists={playlists} />
      </section>
    </div>
  );
}

