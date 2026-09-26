"use client";

import {
  Search, Loader2, Upload, Edit2, Trash2, Eye, ChevronLeft, ChevronRight,
  Heart, HeartCrack, ArrowUp, ArrowDown, ArrowUpDown, Play, Pause, Music
} from "lucide-react";
import { buildMediaUrl } from "../../../lib/api/client";
import { formatDuration } from "../../../lib/formatters";
import { BackendMusicResponse as MusicResponse } from "../../../types/backend";
import { usePlayerStore } from "../../../stores/player-store";
import { mapMusicToTrack } from "../../../repositories/music.repository";
import { cn } from "../../../lib/utils";

type SortField = "id" | "title" | "artist" | "genre" | "likes" | "dislikes";

interface TracksTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingData: boolean;
  filteredTracks: MusicResponse[];
  tracksPage: number;
  tracksTotalPages: number;
  setTracksPage: (fn: (prev: number) => number) => void;
  tracksSortBy: SortField;
  tracksSortDirection: "asc" | "desc";
  onSortTracks: (field: SortField) => void;
  onCreateTrack: () => void;
  onEditTrack: (trk: MusicResponse) => void;
  onDeleteTrack: (id: number, title: string) => void;
  onViewDetails: (trk: MusicResponse) => void;
}

function TableTrackPlayImage({ track, queue }: { track: MusicResponse; queue?: MusicResponse[] }) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrent = currentTrack?.id === String(track.id);
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      const mappedTrack = mapMusicToTrack(track);
      const playlistQueue = queue && queue.length > 0 ? queue.map(mapMusicToTrack) : [mappedTrack];
      playTrack(mappedTrack, playlistQueue);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePlayClick}
      className={cn(
        "relative group/cover w-9 h-9 rounded-lg overflow-hidden shrink-0 border bg-slate-100 flex items-center justify-center shadow-2xs cursor-pointer focus:outline-none transition-all",
        isThisPlaying
          ? "border-indigo-500 ring-2 ring-indigo-500/30"
          : isCurrent
            ? "border-indigo-400"
            : "border-slate-200/70 hover:border-slate-300"
      )}
      aria-label={isThisPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
      title={isThisPlaying ? "Pause" : "Play"}
    >
      {track.artist?.image ? (
        <img
          src={buildMediaUrl(track.artist.image.url)}
          alt={track.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-200",
            !isThisPlaying && "group-hover/cover:scale-105"
          )}
        />
      ) : (
        <Music className={cn("w-4 h-4", isCurrent ? "text-indigo-600" : "text-slate-400")} />
      )}

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-150",
          isThisPlaying
            ? "bg-black/45 opacity-100 text-white"
            : isCurrent
              ? "bg-black/35 opacity-100 text-white"
              : "bg-black/30 opacity-0 group-hover/cover:opacity-100 text-white hover:bg-black/45"
        )}
      >
        {isThisPlaying ? (
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Pause className="w-3 h-3 fill-current text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-600/95 hover:bg-indigo-600 text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform">
            <Play className="w-3 h-3 fill-current text-white ml-0.5" />
          </div>
        )}
      </div>
    </button>
  );
}

function SortIcon({ field, sortBy, direction }: { field: SortField; sortBy: SortField; direction: "asc" | "desc" }) {
  if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 hover:opacity-100" />;
  return direction === "asc" ? (
    <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
  );
}

export function TracksTab({
  searchQuery,
  setSearchQuery,
  loadingData,
  filteredTracks,
  tracksPage,
  tracksTotalPages,
  setTracksPage,
  tracksSortBy,
  tracksSortDirection,
  onSortTracks,
  onCreateTrack,
  onEditTrack,
  onDeleteTrack,
  onViewDetails,
}: TracksTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 shrink-0 select-none">
            <span className="text-slate-400 font-medium">Sort:</span>
            <span className="font-semibold text-slate-850 capitalize">
              {tracksSortBy === "likes" ? "Likes" : tracksSortBy === "dislikes" ? "Dislikes" : tracksSortBy}
            </span>
            <span className="text-indigo-600 font-bold uppercase text-[10px]">
              ({tracksSortDirection})
            </span>
          </div>
        </div>

        <button
          onClick={onCreateTrack}
          className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          Single Upload
        </button>
      </div>

      {loadingData ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
            <table className="w-full min-w-[980px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider select-none">
                  <th
                    className="p-3.5 w-16 cursor-pointer hover:bg-slate-100/80 transition-colors"
                    onClick={() => onSortTracks("id")}
                    title="Sort by ID"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tracksSortBy === "id" ? "text-indigo-600 font-bold" : ""}>ID</span>
                      <SortIcon field="id" sortBy={tracksSortBy} direction={tracksSortDirection} />
                    </div>
                  </th>
                  <th
                    className="p-3.5 w-[200px] max-w-[220px] cursor-pointer hover:bg-slate-100/80 transition-colors"
                    onClick={() => onSortTracks("title")}
                    title="Sort by Title"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tracksSortBy === "title" ? "text-indigo-600 font-bold" : ""}>Title</span>
                      <SortIcon field="title" sortBy={tracksSortBy} direction={tracksSortDirection} />
                    </div>
                  </th>
                  <th
                    className="p-3.5 w-[130px] cursor-pointer hover:bg-slate-100/80 transition-colors"
                    onClick={() => onSortTracks("artist")}
                    title="Sort by Artist"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tracksSortBy === "artist" ? "text-indigo-600 font-bold" : ""}>Artist</span>
                      <SortIcon field="artist" sortBy={tracksSortBy} direction={tracksSortDirection} />
                    </div>
                  </th>
                  <th
                    className="p-3.5 w-20 cursor-pointer hover:bg-slate-100/80 transition-colors"
                    onClick={() => onSortTracks("genre")}
                    title="Sort by Genre"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tracksSortBy === "genre" ? "text-indigo-600 font-bold" : ""}>Genre</span>
                      <SortIcon field="genre" sortBy={tracksSortBy} direction={tracksSortDirection} />
                    </div>
                  </th>
                  <th className="p-3.5 w-20 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSortTracks("likes")}
                        className={`inline-flex items-center gap-1 p-1 rounded-md transition-all cursor-pointer ${
                          tracksSortBy === "likes"
                            ? "text-red-600 bg-red-50 border border-red-200/80 shadow-2xs"
                            : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                        }`}
                        title="Sort by Likes"
                      >
                        <Heart className={`w-3.5 h-3.5 ${tracksSortBy === "likes" ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                        {tracksSortBy === "likes" && (
                          tracksSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-red-600" /> : <ArrowDown className="w-3 h-3 text-red-600" />
                        )}
                      </button>
                      <span className="text-slate-300 font-normal">/</span>
                      <button
                        type="button"
                        onClick={() => onSortTracks("dislikes")}
                        className={`inline-flex items-center gap-1 p-1 rounded-md transition-all cursor-pointer ${
                          tracksSortBy === "dislikes"
                            ? "text-slate-800 bg-slate-100 border border-slate-300 shadow-2xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Sort by Dislikes"
                      >
                        <HeartCrack className={`w-3.5 h-3.5 ${tracksSortBy === "dislikes" ? "text-slate-700" : "text-slate-400"}`} />
                        {tracksSortBy === "dislikes" && (
                          tracksSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-slate-800" /> : <ArrowDown className="w-3 h-3 text-slate-800" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="p-3.5 text-right w-28 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTracks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                      No tracks found.
                    </td>
                  </tr>
                ) : (
                  filteredTracks.map((trk) => (
                    <tr key={trk.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 w-16">{trk.id}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <TableTrackPlayImage track={trk} queue={filteredTracks} />
                          <div className="min-w-0 flex flex-col">
                            <span
                              className="font-bold text-slate-850 text-[13px] hover:text-indigo-600 transition-colors cursor-pointer truncate max-w-[180px]"
                              onClick={() => onViewDetails(trk)}
                              title={trk.title}
                            >
                              {trk.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono leading-tight mt-0.5">
                              {formatDuration(trk.duration || 0, true)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {trk.artist ? (
                          <span className="font-semibold text-slate-700">{trk.artist.name}</span>
                        ) : (
                          <span className="text-slate-450 font-medium">—</span>
                        )}
                      </td>
                      <td className="p-3.5 w-20">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200/50">
                          {trk.genre || "Pop"}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap w-20">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5 text-red-500 bg-red-50/60 border border-red-100/70 px-1.5 py-0.5 rounded-md text-[11px] font-semibold" title="Likes">
                            <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500 shrink-0" />
                            <span>{trk.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-slate-500 bg-slate-50/60 border border-slate-200/70 px-1.5 py-0.5 rounded-md text-[11px] font-semibold" title="Dislikes">
                            <HeartCrack className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{trk.dislikeCount || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-right w-28">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDetails(trk)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 border border-slate-200 transition-all cursor-pointer bg-white shadow-2xs"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditTrack(trk)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 text-slate-500 border border-slate-200 transition-all cursor-pointer bg-white shadow-2xs"
                            title="Edit details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTrack(trk.id, trk.title)}
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-650 text-red-500 border border-slate-200 transition-all cursor-pointer bg-white shadow-2xs"
                            title="Delete track"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-450">
              Page <span className="font-bold text-slate-700">{tracksPage + 1}</span> of <span className="font-bold text-slate-700">{tracksTotalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={tracksPage === 0}
                onClick={() => setTracksPage((prev) => Math.max(prev - 1, 0))}
                className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={tracksPage >= tracksTotalPages - 1}
                onClick={() => setTracksPage((prev) => prev + 1)}
                className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
