"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Genre } from "../../types/genre";
import { musicService } from "../../services/music.service";
import { Loader, ArrowRight } from "lucide-react";

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const data = await musicService.getGenres();
        setGenres(data);
      } catch (err) {
        console.error("Error fetching genres:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading genre catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Browse Genres
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Explore tracks, artists, and playlists categorized by genre
        </p>
      </div>

      {/* Genres Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/genres/${genre.slug}`}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col justify-between h-36"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                #{genre.slug}
              </span>
              <h3 className="text-base font-bold text-slate-800 capitalize group-hover:text-[#365377] transition-colors">
                {genre.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {genre.description || `Popular ${genre.name} hits and compilations.`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
              <span>{genre.trackCount || 10}+ Tracks</span>
              <div className="flex items-center gap-1 text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

