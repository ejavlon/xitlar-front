"use client";

import { Search, Loader2, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { buildMediaUrl, DEFAULT_AVATAR } from "../../../lib/api/client";
import { BackendArtistResponse } from "../../../types/backend";

type ArtistResponse = BackendArtistResponse;

interface ArtistsTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingData: boolean;
  filteredArtists: ArtistResponse[];
  artistsPage: number;
  artistsTotalPages: number;
  setArtistsPage: (fn: (prev: number) => number) => void;
  onCreateArtist: () => void;
  onEditArtist: (art: ArtistResponse) => void;
  onDeleteArtist: (id: number, name: string) => void;
}

export function ArtistsTab({
  searchQuery,
  setSearchQuery,
  loadingData,
  filteredArtists,
  artistsPage,
  artistsTotalPages,
  setArtistsPage,
  onCreateArtist,
  onEditArtist,
  onDeleteArtist,
}: ArtistsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
          />
        </div>

        <button
          onClick={onCreateArtist}
          className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Artist
        </button>
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
                  <th className="p-3.5">Image</th>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Genre</th>
                  <th className="p-3.5">Tracks</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArtists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">
                      No artists found.
                    </td>
                  </tr>
                ) : (
                  filteredArtists.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={art.image ? buildMediaUrl(art.image.url) : DEFAULT_AVATAR}
                          alt={art.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs"
                        />
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{art.id}</td>
                      <td className="p-3.5 font-semibold text-slate-850">{art.name}</td>
                      <td className="p-3.5 text-slate-650">{art.genre}</td>
                      <td className="p-3.5 text-slate-500 font-medium">{art.countOfTrack || 0}</td>
                      <td className="p-3.5 text-slate-500 font-medium">⭐ {art.averageRating ? art.averageRating.toFixed(1) : "0.0"}</td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => onEditArtist(art)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteArtist(art.id, art.name)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 transition-colors"
                          title="Delete artist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
              Page <span className="font-bold text-slate-700">{artistsPage + 1}</span> of <span className="font-bold text-slate-700">{artistsTotalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={artistsPage === 0}
                onClick={() => setArtistsPage((prev) => Math.max(prev - 1, 0))}
                className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={artistsPage >= artistsTotalPages - 1}
                onClick={() => setArtistsPage((prev) => prev + 1)}
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
