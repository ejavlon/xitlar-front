"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Track } from "../../../types/track";
import { Artist } from "../../../types/artist";
import { Playlist } from "../../../types/playlist";
import { musicService } from "../../../services/music.service";
import { artistService } from "../../../services/artist.service";
import { TrackRow } from "../../../components/music/track-row";
import { ArtistGrid } from "../../../components/music/artist-grid";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { Loader } from "lucide-react";

export default function GenreDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "pop";

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded track slices
  const [showAllFresh, setShowAllFresh] = useState(false);
  const [showAllTop, setShowAllTop] = useState(false);

  useEffect(() => {
    const fetchGenreData = async () => {
      if (!slug) return;
      try {
        setLoading(true);

        const [tracksData, playlistsData, artistsData] = await Promise.all([
          musicService.getTracksByGenre(slug),
          musicService.getPlaylistsByGenre(slug),
          artistService.getArtists(),
        ]);

        // If genre tracks are few in mock data, fill with popular tracks
        let allGenreTracks = tracksData;
        if (allGenreTracks.length < 8) {
          const popular = await musicService.getPopularTracks();
          allGenreTracks = [...tracksData, ...popular.slice(0, 12 - tracksData.length)];
        }

        setTracks(allGenreTracks);
        setPlaylists(playlistsData.length > 0 ? playlistsData : await musicService.getPlaylists());
        setArtists(artistsData.slice(0, 6));
      } catch (err) {
        console.error("Error fetching genre detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading genre catalog...</p>
      </div>
    );
  }

  // Split tracks into Fresh Releases and Top Tracks (Matching Sefon Screenshot)
  const freshTracks = showAllFresh ? tracks : tracks.slice(0, 5);
  const topTracks = showAllTop
    ? [...tracks].sort((a, b) => b.likesCount - a.likesCount)
    : [...tracks].sort((a, b) => b.likesCount - a.likesCount).slice(0, 5);

  return (
    <div className="space-y-7 select-none animate-fade-in font-sans">
      {/* 1. TWO-COLUMN TRACK LISTS: Fresh Releases & Top Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-1">
        {/* Left Column: Fresh Releases */}
        <div className="space-y-3">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Fresh Releases
          </h2>

          <div className="divide-y divide-slate-100">
            {freshTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                playlistTracks={freshTracks}
                variant="compact"
              />
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAllFresh(!showAllFresh)}
              className="mt-2 px-5 py-1.5 border border-slate-300 hover:border-slate-400 rounded-full text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none shadow-2xs"
            >
              {showAllFresh ? "Show less" : "View all"}
            </button>
          </div>
        </div>

        {/* Right Column: Top Tracks */}
        <div className="space-y-3">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Top Tracks
          </h2>

          <div className="divide-y divide-slate-100">
            {topTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                playlistTracks={topTracks}
                variant="compact"
              />
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAllTop(!showAllTop)}
              className="mt-2 px-5 py-1.5 border border-slate-300 hover:border-slate-400 rounded-full text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none shadow-2xs"
            >
              {showAllTop ? "Show less" : "View all"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. TOP ARTISTS SECTION (Matching Sefon Screenshot) */}
      <section className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Top Artists
          </h2>
          <Link
            href="/artists"
            className="text-[13px] sm:text-[14px] text-slate-400 hover:text-[#365377] font-medium transition-colors"
          >
            View all
          </Link>
        </div>
        <ArtistGrid artists={artists} />
      </section>

      {/* 4. COLLECTIONS / SELECTIONS SECTION (Matching Sefon Screenshot) */}
      <section className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Collections
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


