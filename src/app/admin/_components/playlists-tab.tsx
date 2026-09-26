"use client";

import { Search, Loader2, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { buildMediaUrl, DEFAULT_PLAYLIST_COVER } from "../../../lib/api/client";
import { BackendPlaylistResponse as PlaylistResponse } from "../../../types/backend";

interface PlaylistsTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingData: boolean;
  filteredPlaylists: PlaylistResponse[];
  playlistsPage: number;
  playlistsTotalPages: number;
  setPlaylistsPage: (fn: (prev: number) => number) => void;
  onCreatePlaylist: () => void;
  onEditPlaylist: (pl: PlaylistResponse) => void;
  onDeletePlaylist: (id: number, title: string) => void;
  onPlaylistDetails: (pl: PlaylistResponse) => void;
}

export function PlaylistsTab({
  searchQuery,
  setSearchQuery,
  loadingData,
  filteredPlaylists,
  playlistsPage,
  playlistsTotalPages,
  setPlaylistsPage,
  onCreatePlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  onPlaylistDetails,
}: PlaylistsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kolleksiya qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
          />
        </div>

        <button
          onClick={onCreatePlaylist}
          className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Kolleksiya qo&apos;shish
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
                  <th className="p-3.5">Muqova</th>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Nomi</th>
                  <th className="p-3.5">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Tag nomi
                    </div>
                  </th>
                  <th className="p-3.5">Tavsif</th>
                  <th className="p-3.5">Qo&apos;shiqlar</th>
                  <th className="p-3.5">Yaratuvchi</th>
                  <th className="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlaylists.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-medium">
                      Hech qanday kolleksiya topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredPlaylists.map((pl) => (
                    <tr key={pl.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={pl.image ? buildMediaUrl(pl.image.url) : DEFAULT_PLAYLIST_COVER}
                          alt={pl.title}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-2xs"
                        />
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{pl.id}</td>
                      <td className="p-3.5 font-semibold text-slate-850">{pl.title}</td>
                      <td className="p-3.5">
                        {pl.tagName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-semibold">
                            <Tag className="w-2.5 h-2.5" />
                            #{pl.tagName}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-[160px] truncate">{pl.description || "—"}</td>
                      <td className="p-3.5 text-slate-650 font-semibold">{pl.trackCount || 0}</td>
                      <td className="p-3.5 text-slate-500 font-medium">
                        {pl.createdBy ? `@${pl.createdBy.username}` : "System"}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => onPlaylistDetails(pl)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-indigo-650 hover:text-indigo-800 transition-colors font-bold text-[11px]"
                          title="Qo'shiqlarni boshqarish"
                        >
                          Qo&apos;shiqlar
                        </button>
                        <button
                          onClick={() => onEditPlaylist(pl)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlaylist(pl.id, pl.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 transition-colors"
                          title="O'chirish"
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
              Sahifa <span className="font-bold text-slate-700">{playlistsPage + 1}</span> / <span className="font-bold text-slate-700">{playlistsTotalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={playlistsPage === 0}
                onClick={() => setPlaylistsPage((prev) => Math.max(prev - 1, 0))}
                className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={playlistsPage >= playlistsTotalPages - 1}
                onClick={() => setPlaylistsPage((prev) => prev + 1)}
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
