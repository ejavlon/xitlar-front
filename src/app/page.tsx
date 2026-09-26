// Server Component — "use client" yo'q
// AppShell { children } ga server component uzatilishi mumkin (Next.js 14 pattern)
import Link from "next/link";
import { musicService } from "../services/music.service";
import { artistService } from "../services/artist.service";
import { TrackList } from "../components/music/track-list";
import { ArtistGrid } from "../components/music/artist-grid";
import { PlaylistGrid } from "../components/music/playlist-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xitlar — Discover Music",
  description: "Discover popular artists, trending hits, and curated music collections.",
};

// Serverda data fetch — hydration yo'q, TTFB tezroq
export default async function HomePage() {
  const [popularTracks, popularArtists, playlists] = await Promise.all([
    musicService.getPopularTracks().catch(() => []),
    artistService.getArtists().catch(() => []),
    musicService.getCollections().catch(() => []),
  ]);

  return (
    <div className="space-y-5">
      {/* 1. POPULAR ARTISTS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between pb-0.5">
          <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-900 tracking-tight">
            Popular Artists
          </h2>
          <Link
            href="/artists"
            className="text-xs text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <ArtistGrid artists={popularArtists.slice(0, 6)} />
      </section>

      {/* 2. TRENDING HITS */}
      <section className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between pb-0.5">
          <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-900 tracking-tight">
            Trending Hits
          </h2>
          <Link
            href="/trending"
            className="text-xs text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <TrackList tracks={popularTracks.slice(0, 10)} />
      </section>

      {/* 3. MUSIC COLLECTIONS */}
      <section className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between pb-0.5">
          <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-900 tracking-tight">
            Music Collections
          </h2>
          <Link
            href="/collections"
            className="text-xs text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <PlaylistGrid playlists={playlists.slice(0, 6)} />
      </section>
    </div>
  );
}
