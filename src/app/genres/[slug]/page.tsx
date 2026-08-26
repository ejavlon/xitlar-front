"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Genre } from "../../../types/genre";
import { Track } from "../../../types/track";
import { Artist } from "../../../types/artist";
import { Playlist } from "../../../types/playlist";
import { musicService } from "../../../services/music.service";
import { artistService } from "../../../services/artist.service";
import { TrackList } from "../../../components/music/track-list";
import { ArtistGrid } from "../../../components/music/artist-grid";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { ArrowLeft, Loader } from "lucide-react";

export default function GenreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [genre, setGenre] = useState<Genre | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenreData = async () => {
      if (!slug) return;
      try {
        setLoading(true);

        const genreInfo = await musicService.getGenreBySlug(slug);
        setGenre(genreInfo);

        if (genreInfo) {
          const [tracksData, playlistsData, artistsData] = await Promise.all([
            musicService.getTracksByGenre(slug),
            musicService.getPlaylistsByGenre(slug),
            artistService.getArtists()
          ]);

          setTracks(tracksData);
          setPlaylists(playlistsData);

          const filteredArtists = artistsData.filter((a) =>
            a.genres.includes(slug)
          );
          setArtists(filteredArtists);
        }
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
        <p className="text-xs text-slate-400 font-medium">Filtering music archives...</p>
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Genre Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find the music genre &ldquo;{slug}&rdquo;.
        </p>
        <button
          onClick={() => router.push("/genres")}
          className="px-5 py-2 bg-[#365377] text-white font-semibold text-xs rounded-md hover:bg-[#2d4665] transition-colors"
        >
          Browse All Genres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Genre Header / Banner */}
      <section className="space-y-1 pb-4 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">
          #{genre.slug}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
          {genre.name}
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          {genre.description || `Discover matching artists, popular tracks, and collections in the ${genre.name} music style.`}
        </p>
      </section>

      {/* Popular Tracks in Genre */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Popular {genre.name} Tracks</h2>
        <TrackList tracks={tracks} fallbackText={`No tracks found in the ${genre.name} genre.`} />
      </section>

      {/* Artists in Genre */}
      {artists.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">{genre.name} Artists</h2>
          <ArtistGrid artists={artists} />
        </section>
      )}

      {/* Collections in Genre */}
      {playlists.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">{genre.name} Collections</h2>
          <PlaylistGrid playlists={playlists} />
        </section>
      )}
    </div>
  );
}

