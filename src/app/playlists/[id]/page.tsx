"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playlist } from "../../../types/playlist";
import { musicService } from "../../../services/music.service";
import { usePlayerStore } from "../../../stores/player-store";
import { TrackRow } from "../../../components/music/track-row";
import { PlaylistGrid } from "../../../components/music/playlist-grid";
import { formatDuration } from "../../../lib/formatters";
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
  ChevronRight
} from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  date: string;
  text: string;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "1",
    author: "Vyacheslav",
    date: "7 June at 13:15",
    text: "Thanks to the creators of the site, very tasteful collections and awesome track selection!"
  },
  {
    id: "2",
    author: "Saule",
    date: "30 April at 16:33",
    text: "Great compilation, listening on repeat during daily commute."
  },
  {
    id: "3",
    author: "Elzhas",
    date: "25 April at 10:59",
    text: "Just registered today, but I've already been enjoying music here for years."
  },
  {
    id: "4",
    author: "Shakir",
    date: "10 October 2025 at 07:46",
    text: "A truly wonderful music site for any mood or weather."
  },
  {
    id: "5",
    author: "Julia Savchenko",
    date: "20 April 2025 at 16:08",
    text: "Huge thanks! Best site with high quality sound for every taste."
  }
];

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "top-hits-2026";

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [similarPlaylists, setSimilarPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<"date" | "popular" | "alphabetical">("date");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [commentAuthor, setCommentAuthor] = useState("Javlon");
  const [commentText, setCommentText] = useState("");

  const { playQueue } = usePlayerStore();

  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [data, allPlaylists, allTracks] = await Promise.all([
          musicService.getPlaylistById(id),
          musicService.getPlaylists(),
          musicService.getPopularTracks()
        ]);

        if (data) {
          // If tracks are few, supplement with popular tracks
          let fullTracks = data.tracks || [];
          if (fullTracks.length < 8) {
            fullTracks = [...fullTracks, ...allTracks.slice(0, 10 - fullTracks.length)];
          }
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

    fetchPlaylistData();
  }, [id]);

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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      author: commentAuthor.trim() || "Javlon",
      date: "Just now",
      text: commentText.trim()
    };

    setComments([newComment, ...comments]);
    setCommentText("");
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

  const totalDuration = rawTracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="space-y-7 select-none animate-fade-in font-sans">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* 1. HERO HEADER SECTION (Matching Sefon Screenshot 2) */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
        {/* Large Round Avatar Artwork */}
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Collection Meta Details */}
        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {playlist.title}
          </h1>

          {/* Subtitle details: Date • Duration • Tracks */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
            <span>21 August 2026</span>
            <span>&bull;</span>
            <span>{formatDuration(totalDuration || 12738)}</span>
            <span>&bull;</span>
            <span>{playlist.trackCount || rawTracks.length} tracks</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              #summer
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              #vibe
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              #collection
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1 text-xs text-slate-500">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
            </div>
            <span className="font-bold text-slate-700">4.2</span>
            <span className="text-slate-400 text-[11px]">(votes: 13,409)</span>
          </div>

          {/* Action Buttons (Matches Screenshot 2) */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-3">
            {/* Play All Yellow Button */}
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-full transition-colors shadow-xs focus:outline-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </button>

            {/* Add to Favorites */}
            <button
              onClick={() => alert(`Added "${playlist.title}" to favorites`)}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Add to favorites"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Reload / Updates */}
            <button
              onClick={() => alert("Collection refreshed!")}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Refresh collection"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. TABS & SORTED TRACK LIST (Matching Sefon Screenshot 2 & 3) */}
      <section className="space-y-4">
        {/* Tabs: BY DATE | BY POPULARITY | ALPHABETICAL */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
          {([
            { key: "date", label: "BY DATE" },
            { key: "popular", label: "BY POPULARITY" },
            { key: "alphabetical", label: "ALPHABETICAL" }
          ] as const).map((tab) => (
            <button
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
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              playlistTracks={sortedTracks}
            />
          ))}
        </div>

        {/* 3. PAGINATION (Dynamic Sliding Window - Matching Sefon Pagination) */}
        {(() => {
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
      </section>

      {/* 4. SIMILAR COLLECTIONS SECTION (Matching Sefon Screenshot 3) */}
      <section className="space-y-3 pt-6 border-t border-slate-100">
        <h2 className="text-base sm:text-[18px] font-bold text-slate-900 tracking-tight">
          Similar Collections
        </h2>
        <PlaylistGrid playlists={similarPlaylists} />
      </section>

      {/* 5. COMMENTS SECTION (Matching Sefon Screenshot 4) */}
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
    </div>
  );
}

