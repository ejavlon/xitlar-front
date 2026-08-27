"use client";

import React, { useState, useRef, useEffect } from "react";
import { Track } from "../../types/track";
import { Playlist } from "../../types/playlist";
import { mockPlaylists } from "../../mock/playlists";
import { Plus, X, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface AddToPlaylistPopoverProps {
  track: Track | null;
  disabled?: boolean;
  className?: string;
  position?: "top" | "bottom";
  triggerSize?: "sm" | "md";
}

export function AddToPlaylistPopover({
  track,
  disabled = false,
  className,
  position = "top",
  triggerSize = "md"
}: AddToPlaylistPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize playlists from mock and track status
  useEffect(() => {
    // Filter user playlists (non-collections)
    const userPlaylists = mockPlaylists.filter((p) => !p.isCollection);
    setPlaylists(userPlaylists);
  }, []);

  // Update checkbox state whenever track changes or popover opens
  useEffect(() => {
    if (!track) {
      setSelectedPlaylists({});
      return;
    }

    const stateMap: Record<string, boolean> = {};
    playlists.forEach((p) => {
      stateMap[p.id] = Boolean(p.tracks?.some((t) => t.id === track.id));
    });
    setSelectedPlaylists(stateMap);
  }, [track, playlists, isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event?.target as Node || e.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setNewTitle("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Focus input when creating mode activates
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleTogglePlaylist = (playlistId: string) => {
    if (!track) return;

    setSelectedPlaylists((prev) => {
      const isCurrentlyChecked = prev[playlistId];
      const nextChecked = !isCurrentlyChecked;

      // Update mock playlist tracks in memory
      const targetPl = playlists.find((p) => p.id === playlistId);
      if (targetPl) {
        if (nextChecked) {
          if (!targetPl.tracks) targetPl.tracks = [];
          if (!targetPl.tracks.some((t) => t.id === track.id)) {
            targetPl.tracks.push(track);
            targetPl.trackCount = targetPl.tracks.length;
          }
        } else {
          if (targetPl.tracks) {
            targetPl.tracks = targetPl.tracks.filter((t) => t.id !== track.id);
            targetPl.trackCount = targetPl.tracks.length;
          }
        }
      }

      return {
        ...prev,
        [playlistId]: nextChecked
      };
    });
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || !track) return;

    const newId = `pl-${Date.now()}`;
    const newPl: Playlist = {
      id: newId,
      title,
      coverUrl: track.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&q=80",
      trackCount: 1,
      isCollection: false,
      creator: "Javlon",
      tracks: [track]
    };

    mockPlaylists.unshift(newPl);
    setPlaylists((prev) => [newPl, ...prev]);
    setSelectedPlaylists((prev) => ({ ...prev, [newId]: true }));
    setNewTitle("");
    setIsCreating(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center", className)}>
      {/* Popover Window */}
      {isOpen && track && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-[240px] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in select-none",
            position === "top"
              ? "absolute bottom-[calc(100%+14px)] right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-0"
              : "absolute top-[calc(100%+8px)] right-0"
          )}
          role="dialog"
          aria-label="In playlists"
        >
          {/* 1. Header (Brand Blue with Title and Close Button - Matches Screenshot) */}
          <div className="h-8 bg-[#456690] text-white px-3 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide">
              In playlists
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Playlists List with Checkboxes */}
          <div className="max-h-48 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
            {playlists.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No playlists yet
              </div>
            ) : (
              playlists.map((pl) => {
                const isChecked = Boolean(selectedPlaylists[pl.id]);
                return (
                  <label
                    key={pl.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlaylist(pl.id);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                        isChecked
                          ? "bg-[#456690] border-[#456690] text-white shadow-2xs"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      )}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Playlist Title */}
                    <span className="text-xs text-slate-700 group-hover:text-slate-900 truncate flex-1 font-medium">
                      {pl.title}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* 3. Footer: Create New Playlist / Input */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/70">
            {isCreating ? (
              <form
                onSubmit={(e) => {
                  e.stopPropagation();
                  handleCreatePlaylist(e);
                }}
                className="space-y-1.5 animate-fade-in"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Playlist name..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-7 px-2 text-xs bg-white border border-slate-200 rounded outline-none focus:border-[#456690] text-slate-800 placeholder:text-slate-400"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreating(false);
                      setNewTitle("");
                    }}
                    className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-700 rounded hover:bg-slate-200/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] font-semibold rounded text-white transition-colors",
                      newTitle.trim()
                        ? "bg-[#456690] hover:bg-[#38557a]"
                        : "bg-slate-300 cursor-not-allowed"
                    )}
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreating(true);
                }}
                className="w-full text-left px-2 py-1 text-xs font-semibold text-[#456690] hover:text-[#2f496d] hover:underline transition-colors block"
              >
                Create new playlist
              </button>
            )}
          </div>

          {/* Pointer Arrow */}
          {position === "top" ? (
            <div className="hidden sm:block absolute -bottom-1.5 right-4 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-200" />
          ) : (
            <div className="hidden sm:block absolute -top-1.5 right-3 w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-[#456690]" />
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && track) setIsOpen(!isOpen);
        }}
        disabled={disabled || !track}
        className={cn(
          "rounded transition-colors focus:outline-none",
          triggerSize === "sm"
            ? "p-0.5 text-slate-400 hover:text-slate-700"
            : "p-1 text-slate-500 hover:text-slate-900",
          disabled || !track
            ? "text-slate-300 pointer-events-none cursor-not-allowed"
            : isOpen
            ? "text-[#456690] bg-slate-100"
            : "cursor-pointer"
        )}
        aria-label="Add to playlist"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Plus className={triggerSize === "sm" ? "w-4 h-4 stroke-[1.75]" : "w-4.5 h-4.5"} />
      </button>
    </div>
  );
}
