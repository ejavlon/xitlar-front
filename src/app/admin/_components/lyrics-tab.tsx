"use client";

import { Search, Loader2, Trash2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { BackendMusicResponse as MusicResponse } from "../../../types/backend";

interface LyricsTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingData: boolean;
  filteredTracks: MusicResponse[];
  tracksPage: number;
  tracksTotalPages: number;
  setTracksPage: (fn: (prev: number) => number) => void;
  onManageLyrics: (trk: MusicResponse) => void;
  onDeleteLyrics: (trk: MusicResponse) => void;
}

export function LyricsTab({
  searchQuery,
  setSearchQuery,
  loadingData,
  filteredTracks,
  tracksPage,
  tracksTotalPages,
  setTracksPage,
  onManageLyrics,
  onDeleteLyrics,
}: LyricsTabProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search tracks by title/artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
        />
      </div>

      {loadingData ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Artist</th>
                  <th className="p-3.5">Genre</th>
                  <th className="p-3.5">Lyrics Status</th>
                  <th className="p-3.5 text-right">Actions</th>
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
                      <td className="p-3.5 font-mono text-slate-400">{trk.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-850 text-[13px]">{trk.title}</span>
                      </td>
                      <td className="p-3.5 text-slate-650 font-semibold">{trk.artist?.name || "—"}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200/50">
                          {trk.genre || "Pop"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {trk.lyrics ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            Has Lyrics ({trk.lyrics.language.toUpperCase()})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-450 border border-slate-200/50">
                            No Lyrics
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onManageLyrics(trk)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer bg-white text-indigo-650 border-slate-250 hover:bg-slate-50"
                            title={trk.lyrics ? "Edit lyrics" : "Add lyrics"}
                          >
                            {trk.lyrics ? "Edit Lyrics" : "Add Lyrics"}
                          </button>
                          {trk.lyrics && (
                            <button
                              onClick={() => onDeleteLyrics(trk)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 border border-slate-200/50 transition-all cursor-pointer bg-white"
                              title="Delete lyrics"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
