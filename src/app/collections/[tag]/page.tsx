"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playlist } from "../../../types/playlist";
import { musicService } from "../../../services/music.service";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { Loader, ArrowLeft, Tag } from "lucide-react";

export default function CollectionTagPage() {
  const params = useParams();
  const router = useRouter();
  const rawTag = (params?.tag as string) || "playlists";
  const cleanTag = decodeURIComponent(rawTag).replace(/^#/, "");

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTagPlaylists = async () => {
      try {
        setLoading(true);
        const data = await musicService.getPlaylistsByTag(cleanTag);
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching tag collection:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTagPlaylists();
  }, [cleanTag]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 select-none">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening #{cleanTag} collection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in font-sans">
      {/* Navigation & Header */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#365377]" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                #{cleanTag}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated playlists and music collections tagged with #{cleanTag}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"} found
          </span>
        </div>
      </div>

      {/* Playlists Grid */}
      <PlaylistGrid
        playlists={playlists}
        fallbackText={`No playlists currently tagged with #${cleanTag}.`}
      />
    </div>
  );
}
