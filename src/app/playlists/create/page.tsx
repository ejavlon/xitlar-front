"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Track } from "../../../types/track";
import { Playlist } from "../../../types/playlist";
import { usePlayerStore } from "../../../stores/player-store";
import { useAuthStore } from "../../../stores/auth-store";
import { formatDuration } from "../../../lib/formatters";
import { api } from "../../../lib/api/client";
import { musicService } from "../../../services/music.service";
import {
  Disc,
  Play,
  Pause,
  Plus,
  X,
  Search,
  Check,
  Music2,
  Trash2
} from "lucide-react";
import { cn } from "../../../lib/utils";

export default function CreatePlaylistPage() {
  const router = useRouter();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const [title, setTitle] = useState("New Playlist");
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  // Debounced real search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await musicService.searchTracks(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search tracks failed:", err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Calculate total playlist duration
  const totalDuration = useMemo(() => {
    return selectedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  }, [selectedTracks]);

  const handleAddTrack = (track: Track) => {
    if (!selectedTracks.some((t) => t.id === track.id)) {
      setSelectedTracks((prev) => [...prev, track]);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handlePlayAll = () => {
    if (selectedTracks.length > 0) {
      playTrack(selectedTracks[0], selectedTracks);
    }
  };

  const user = useAuthStore((s) => s.user);

  const handleSavePlaylist = async () => {
    if (!title.trim()) {
      alert("Please enter a playlist title.");
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify({ title: title.trim(), description: "Custom user playlist" })], { type: "application/json" }));
      if (coverFile) {
        formData.append("file", coverFile);
      }
      
      const playlistResponse = await api.post<any>("/api/v1/playlists", formData);
      if (playlistResponse && playlistResponse.id) {
        const playlistId = playlistResponse.id;
        
        // If there are tracks, bulk add them
        if (selectedTracks.length > 0) {
          const trackIds = selectedTracks.map(t => Number(t.id));
          await api.post(`/api/v1/playlists/${playlistId}/musics/bulk`, {
            musicIds: trackIds
          });
        }
        
        router.push(`/playlists/${playlistId}`);
      } else {
        throw new Error("Failed to create playlist");
      }
    } catch (err: any) {
      console.error("Playlist creation failed:", err);
      alert(err.message || "Failed to save playlist. Note: Standard USER role might be restricted from creating playlists on the backend.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 py-3 select-none animate-fade-in font-sans">
      {/* 1. HERO HEADER SECTION (Matches Screenshot 2) */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 sm:p-6 bg-slate-50/70 rounded-xl border border-slate-200/80">
        {/* Cancel / Close Button with Delete Confirmation Popover on Top-Right */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors focus:outline-none"
            aria-label="Delete playlist"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Delete Confirmation Popover (Matches Screenshot) */}
          {isDeleteModalOpen && (
            <div className="absolute right-0 top-8 w-60 sm:w-64 p-3.5 bg-[#456690] text-white rounded-xl shadow-2xl border border-[#38557a] z-50 animate-fade-in text-center select-none">
              <p className="text-xs font-medium text-white/95 leading-snug mb-3">
                Do you really want to delete the playlist?
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/profile?tab=playlists")}
                  className="px-3.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-full transition-colors shadow-2xs cursor-pointer focus:outline-none"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-full transition-colors shadow-2xs cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Circular Vinyl / CD Placeholder Avatar */}
        <label className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200/80 border border-slate-300/80 flex items-center justify-center text-slate-400 shrink-0 shadow-inner overflow-hidden cursor-pointer hover:bg-slate-300/80 transition-colors relative group">
          {coverPreview ? (
            <img src={coverPreview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <Disc className="w-14 h-14 stroke-[1.25] text-slate-400" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider">
            Choose Cover
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>

        {/* Playlist Info & Editable Title */}
        <div className="space-y-2.5 flex-1 min-w-0">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter playlist title..."
              className="text-base sm:text-lg font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-[#456690] outline-none pb-0.5 w-full max-w-[380px] transition-colors"
            />
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {formatDuration(totalDuration, true)}
            </div>
          </div>

          {/* Tag badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
              # playlists
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            {/* Play Button */}
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={selectedTracks.length === 0}
              className={cn(
                "h-[30px] px-4 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-2xs transition-all focus:outline-none",
                selectedTracks.length > 0
                  ? "bg-amber-400 hover:bg-amber-500 text-slate-900 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </button>

            {/* Save Playlist Button */}
            <button
              type="button"
              onClick={handleSavePlaylist}
              disabled={isSaving}
              className="h-[30px] px-4 rounded-full bg-[#456690] hover:bg-[#38557a] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ADD TRACKS SECTION (Matches Screenshot 2) */}
      <div className="space-y-4">
        {/* Full-width Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by artist or track name to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[38px] bg-white border border-slate-200 rounded-lg pl-9 pr-4 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#456690] outline-none transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown / Results List */}
        {searchQuery.trim() && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-md divide-y divide-slate-100 overflow-hidden animate-fade-in">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching tracks found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              searchResults.map((track) => {
                const isAdded = selectedTracks.some((t) => t.id === track.id);
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {track.artist.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDuration(track.duration, true)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          isAdded ? handleRemoveTrack(track.id) : handleAddTrack(track)
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs",
                          isAdded
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            : "bg-[#456690] text-white hover:bg-[#38557a]"
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. PLAYLIST TRACK LIST */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Tracks in Playlist ({selectedTracks.length})
            </h3>
            {selectedTracks.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTracks([])}
                className="text-[11px] text-red-500 hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {selectedTracks.length === 0 ? (
            /* Empty State (Matches Screenshot 2) */
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Music2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs sm:text-[13px] text-slate-500">
                Add your first track to the playlist. Find it using the search bar above and click &ldquo;+&rdquo;.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {selectedTracks.map((track) => {
                const isCurrent = currentTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors group select-none"
                  >
                    {/* Left: Play button + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <button
                        type="button"
                        onClick={() => playTrack(track, selectedTracks)}
                        className={cn(
                          "w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          isCurrent && isPlaying
                            ? "border-[#456690] text-[#456690]"
                            : "border-slate-300 text-slate-500 hover:border-[#456690] hover:text-[#456690]"
                        )}
                        aria-label="Play track"
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {track.artist.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {track.title}
                        </div>
                      </div>
                    </div>

                    {/* Right: Duration + Remove Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDuration(track.duration, true)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrack(track.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors focus:outline-none"
                        title="Remove from playlist"
                        aria-label="Remove from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
