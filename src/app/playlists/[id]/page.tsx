"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playlist } from "../../../types/playlist";
import { musicService } from "../../../services/music.service";
import { usePlayerStore } from "../../../stores/player-store";
import { TrackRow } from "../../../components/music/track-row";
import { useAuthStore } from "../../../stores/auth-store";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { formatDuration } from "../../../lib/formatters";
import { api } from "../../../lib/api/client";
import { cn } from "../../../lib/utils";
import {
  Play,
  Share2,
  Star,
  Loader,
  ArrowLeft,
  Plus,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  X,
  Disc,
  Music2,
  Edit2
} from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  date: string;
  text: string;
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "top-hits-2026";

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [similarPlaylists, setSimilarPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<"date" | "popular" | "alphabetical">("date");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentAuthor, setCommentAuthor] = useState("Anonymous");
  const [commentText, setCommentText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTagName, setEditTagName] = useState("playlists");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      setCommentAuthor(user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username);
    } else {
      setCommentAuthor("Anonymous");
    }
  }, [user]);

  // Load comments from localStorage on mount or id change
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const stored = localStorage.getItem("xitlar_playlist_comments_" + id);
      if (stored) {
        try {
          setComments(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse comments", e);
        }
      } else {
        setComments([]);
      }
    }
  }, [id]);

  const playQueue = usePlayerStore((s) => s.playQueue);

  const fetchPlaylistData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [data, allPlaylists] = await Promise.all([
        musicService.getPlaylistById(id),
        musicService.getPlaylists()
      ]);

      if (data) {
        let fullTracks = data.tracks || [];
        setPlaylist({ ...data, tracks: fullTracks });
      } else {
        setPlaylist(null);
      }

      setSimilarPlaylists(allPlaylists.filter((p) => p.id !== id).slice(0, 6));
    } catch (err) {
      console.error("Error fetching playlist detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
  }, [id]);

  const openEditModal = () => {
    if (!playlist) return;
    setEditTitle(playlist.title);
    setEditTagName(playlist.tagName || "playlists");
    setEditDescription(playlist.description || "");
    setEditCoverFile(null);
    setEditCoverPreview(playlist.coverUrl || null);
    setIsEditModalOpen(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditCoverFile(file);
    if (file) {
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      alert("Please enter a playlist title.");
      return;
    }
    setIsSaving(true);
    try {
      const cleanTag = editTagName.trim().replace(/^#/, "") || "playlists";
      const formData = new FormData();
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              title: editTitle.trim(),
              tagName: cleanTag,
              description: editDescription.trim()
            })
          ],
          { type: "application/json" }
        )
      );
      if (editCoverFile) {
        formData.append("file", editCoverFile);
      }
      await api.put(`/api/v1/playlists/${playlist?.id}`, formData);
      setIsEditModalOpen(false);
      await fetchPlaylistData();
    } catch (err: any) {
      console.error("Failed to update playlist:", err);
      alert(err.message || "Failed to update playlist.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVotePlaylist = async (rating: number) => {
    if (!playlist) return;
    try {
      const updated = await musicService.votePlaylist(playlist.id, rating);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              averageRating: updated.averageRating,
              voteCount: updated.voteCount,
              userRating: updated.userRating
            }
          : null
      );
    } catch (err: any) {
      console.error("Failed to vote playlist:", err);
      alert(err.message || "Please sign in to vote on playlists.");
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks && playlist.tracks.length > 0) {
      playQueue(playlist.tracks, 0);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Collection link copied to clipboard!");
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      if (/^\d+$/.test(id)) {
        await api.delete(`/api/v1/playlists/${id}`);
      }
      router.push("/profile?tab=playlists");
    } catch (err: any) {
      console.error("Failed to delete playlist:", err);
      alert(err.message || "Failed to delete playlist.");
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const date = new Date();
    const dayMonth = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formattedDate = `${dayMonth} at ${time}`;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      author: commentAuthor.trim() || "Anonymous",
      date: formattedDate,
      text: commentText.trim()
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setCommentText("");

    if (typeof window !== "undefined" && id) {
      localStorage.setItem("xitlar_playlist_comments_" + id, JSON.stringify(updatedComments));

      // Store in user comments history if authenticated
      if (user) {
        const username = user.username;
        const storedUserComments = localStorage.getItem("xitlar_user_comments_" + username);
        let userCommentsList = [];
        if (storedUserComments) {
          try {
            userCommentsList = JSON.parse(storedUserComments);
          } catch (err) {
            console.error("Failed to parse user comments", err);
          }
        }
        const newUserComment = {
          id: "uc-" + Date.now(),
          targetName: `Playlist: ${playlist?.title || "Unknown Playlist"}`,
          text: commentText.trim(),
          date: formattedDate
        };
        userCommentsList = [newUserComment, ...userCommentsList];
        localStorage.setItem("xitlar_user_comments_" + username, JSON.stringify(userCommentsList));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading collection...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Collection Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find the music collection you are looking for.
        </p>
        <button
          onClick={() => router.push("/collections")}
          className="px-5 py-2 bg-[#365377] text-white font-semibold text-xs rounded-md hover:bg-[#2d4665] transition-colors"
        >
          View Collections
        </button>
      </div>
    );
  }

  // Sorted tracks according to active tab
  const rawTracks = playlist.tracks || [];
  const sortedTracks = [...rawTracks];
  if (activeTab === "popular") {
    sortedTracks.sort((a, b) => b.likesCount - a.likesCount);
  } else if (activeTab === "alphabetical") {
    sortedTracks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // by date
    sortedTracks.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });
  }

  const totalDuration = rawTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  return (
    <div className="space-y-7 select-none animate-fade-in font-sans">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>
      
      <section className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
        {/* Top-Right Actions (Edit / Delete) */}
        {!playlist.isCollection && (
          <div className="absolute top-0 right-0 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={openEditModal}
              className="p-1.5 text-slate-400 hover:text-slate-750 rounded-full hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Edit playlist"
              title="Edit Playlist"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-750 rounded-full hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Delete playlist"
              title="Delete Playlist"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Delete Confirmation Popover (Matches Screenshot) */}
            {isDeleteModalOpen && (
              <div className="absolute right-0 top-9 w-60 sm:w-64 p-3.5 bg-[#456690] text-white rounded-xl shadow-2xl border border-[#38557a] z-50 animate-fade-in text-center select-none">
                <p className="text-xs font-medium text-white/95 leading-snug mb-3">
                  Do you really want to delete the playlist?
                </p>
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDeletePlaylist}
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
        )}

        {/* Large Round Avatar Artwork (Matches Screenshot) */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-slate-200/90 shadow-xs shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
          {!playlist.isCollection && rawTracks.length === 0 ? (
            <Disc className="w-16 h-16 stroke-[1.25] text-slate-400" />
          ) : (
            <img
              src={playlist.coverUrl}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Collection / Playlist Meta Details */}
        <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {playlist.title}
          </h1>

          {/* Subtitle details: Created Date   Duration   Tracks (Matches Screenshot) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-slate-500 font-medium font-mono">
            <span>
              {playlist.createdAt
                ? new Date(playlist.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                : "1 September 2026"}
            </span>
            <span>{formatDuration(totalDuration || 0, true)}</span>
            <span>{playlist.trackCount || rawTracks.length} tracks</span>
          </div>

          {/* Tag Name Badges (Matches Screenshot) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
            {(playlist.tagName || "playlists")
              .split(",")
              .map((tagStr) => tagStr.trim())
              .filter(Boolean)
              .map((tagItem) => {
                const cleanTag = tagItem.replace(/^#/, "");
                return (
                  <button
                    type="button"
                    key={cleanTag}
                    onClick={() => {
                      router.push(`/collections/${encodeURIComponent(cleanTag.toLowerCase())}`);
                    }}
                    className="text-[11.5px] font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-200 px-3 py-1 rounded-full shadow-2xs transition-colors cursor-pointer"
                  >
                    # {cleanTag}
                  </button>
                );
              })}
          </div>

          {/* Rating & Voting (Matches Screenshot: 4 yellow stars + 1 gray, 4.2 (votes: 13422)) */}
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5 text-xs text-slate-500">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeRating =
                  hoverRating !== null
                    ? hoverRating
                    : playlist.userRating || Math.round(playlist.averageRating || 0);
                const isFilled = star <= activeRating;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleVotePlaylist(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-0.5 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isFilled ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <span className="font-bold text-slate-800 text-sm ml-0.5">
              {(playlist.averageRating || 0.0).toFixed(1)}
            </span>
            <span className="text-slate-400 text-xs font-normal">
              (votes: {playlist.voteCount || 0})
            </span>
          </div>

          {/* Action Buttons (Matches Screenshot 2: Yellow Listen button, +, Reload, Share) */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            {/* Play All Yellow Button */}
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={rawTracks.length === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-full border transition-all shadow-2xs focus:outline-none",
                rawTracks.length > 0
                  ? "bg-[#FCE453] hover:bg-[#ebd344] border-[#e5cd40] text-slate-900 cursor-pointer active:scale-98"
                  : "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </button>

            {/* Add to Favorites */}
            <button
              type="button"
              onClick={() => alert(`Added "${playlist.title}" to favorites`)}
              className="w-9 h-9 rounded-full border border-slate-300/80 hover:border-slate-400 text-slate-700 bg-white flex items-center justify-center transition-colors focus:outline-none shadow-2xs cursor-pointer"
              aria-label="Add to favorites"
              title="Add to favorites"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Reload / Refresh */}
            <button
              type="button"
              onClick={() => fetchPlaylistData()}
              className="w-9 h-9 rounded-full border border-slate-300/80 hover:border-slate-400 text-slate-700 bg-white flex items-center justify-center transition-colors focus:outline-none shadow-2xs cursor-pointer"
              aria-label="Refresh playlist"
              title="Refresh playlist"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full border border-slate-300/80 hover:border-slate-400 text-slate-700 bg-white flex items-center justify-center transition-colors focus:outline-none shadow-2xs cursor-pointer"
              aria-label="Share"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. TABS & TRACK LIST / SEARCH */}
      <section className="space-y-4">
        {/* Track List or Empty State */}
        {rawTracks.length === 0 ? (
          /* Empty State (Matches Screenshot 2) */
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Music2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs sm:text-[13px] text-slate-500">
              Add your first track to the playlist. Find it using the search bar above and click &ldquo;+&rdquo;.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs: BY DATE | BY POPULARITY | ALPHABETICAL */}
            <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
              {([
                { key: "date", label: "BY DATE" },
                { key: "popular", label: "BY POPULARITY" },
                { key: "alphabetical", label: "ALPHABETICAL" }
              ] as const).map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "relative pb-2.5 transition-colors focus:outline-none",
                    activeTab === tab.key
                      ? "text-amber-500 font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Track Rows */}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-2xs">
              {sortedTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  playlistTracks={sortedTracks}
                />
              ))}
            </div>
          </>
        )}
      </section>
      
      {rawTracks.length > 0 &&
        (() => {
          const totalPages = 95;
          let start = Math.max(1, currentPage - 2);
          const end = Math.min(totalPages, start + 4);

          if (end - start < 4) {
            start = Math.max(1, end - 4);
          }

          const pages: number[] = [];
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }

          return (
            <div className="flex items-center justify-start gap-1.5 pt-3 select-none">
              {/* Previous page button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors focus:outline-none disabled:opacity-40"
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* First page if window starts after 1 */}
              {start > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={cn(
                      "w-8 h-8 rounded text-xs font-semibold transition-colors focus:outline-none border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50",
                      currentPage === 1 ? "bg-amber-400 text-slate-900 font-bold shadow-2xs" : ""
                    )}
                  >
                    1
                  </button>
                  {start > 2 && <span className="px-1 text-slate-400 text-xs">...</span>}
                </>
              )}

              {/* Sliding window page buttons */}
              {pages.map((pageNum) => (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded text-xs font-semibold transition-colors focus:outline-none",
                    currentPage === pageNum
                      ? "bg-amber-400 text-slate-900 font-bold shadow-2xs"
                      : "border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {pageNum}
                </button>
              ))}

              {/* Last page if window ends before totalPages */}
              {end < totalPages && (
                <>
                  {end < totalPages - 1 && <span className="px-1 text-slate-400 text-xs">...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className={cn(
                      "w-8 h-8 rounded text-xs font-semibold border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none",
                      currentPage === totalPages ? "bg-amber-400 text-slate-900 font-bold shadow-2xs" : ""
                    )}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next page button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors focus:outline-none disabled:opacity-40"
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })()}
      
      <section className="space-y-3 pt-6 border-t border-slate-100">
        <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
          Similar Collections
        </h2>
        <PlaylistGrid playlists={similarPlaylists} />
      </section>

      <section className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
            Comments
          </h2>
          <span className="text-xs text-slate-400 font-normal">({comments.length})</span>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#365377]"
            />
          </div>

          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Your comment"
            className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#365377] resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#365377] hover:bg-[#2d4665] text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none shadow-xs"
            >
              Send
            </button>
          </div>
        </form>

        {/* Comments Feed */}
        <div className="space-y-2.5 pt-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{comment.author}</span>
                <span className="text-[11px] text-slate-400">{comment.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Playlist Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleUpdatePlaylist} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Edit Playlist Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Cover Image Upload (Clickable vinyl/CD silhouette) */}
              <div className="flex flex-col items-center justify-center gap-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cover Artwork</label>
                <label className="w-24 h-24 rounded-full bg-slate-200/85 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0 shadow-inner overflow-hidden cursor-pointer hover:bg-slate-300 transition-colors relative group">
                  {editCoverPreview ? (
                    <img src={editCoverPreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Disc className="w-12 h-12 stroke-[1.25] text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider">
                    Change
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditFileChange} />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Playlist Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold"
                  placeholder="e.g. My Favorites"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Tag Name</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">#</span>
                  <input
                    type="text"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    className="w-full h-[36px] pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold"
                    placeholder="e.g. retro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="Describe your playlist..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
