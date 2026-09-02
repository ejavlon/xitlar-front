"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Artist } from "../../../types/artist";
import { Track } from "../../../types/track";
import { artistService, ArtistTrackSortMode } from "../../../services/artist.service";
import { usePlayerStore } from "../../../stores/player-store";
import { useAuthStore } from "../../../stores/auth-store";
import { TrackList } from "../../../components/music/track-list";
import {
  Play,
  Share2,
  Star,
  Loader,
  ArrowLeft,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface CommentItem {
  id: string;
  author: string;
  date: string;
  text: string;
}

const ITEMS_PER_PAGE = 8;

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [similarArtists, setSimilarArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState<ArtistTrackSortMode>("popular");
  const [relatedTab, setRelatedTab] = useState<"similar" | "genre">("similar");
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentAuthor, setCommentAuthor] = useState("Anonymous");
  const [commentText, setCommentText] = useState("");

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [votingLoading, setVotingLoading] = useState(false);

  const handleVote = async (rating: number) => {
    if (!user) {
      alert("Please sign in to vote for this artist.");
      return;
    }
    if (!artist || votingLoading) return;
    try {
      setVotingLoading(true);
      const updatedArtist = await artistService.voteArtist(artist.id, rating);
      if (updatedArtist) {
        setArtist(updatedArtist);
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    } finally {
      setVotingLoading(false);
    }
  };

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
      const stored = localStorage.getItem("xitlar_artist_comments_" + id);
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

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [artistData, similarData, tracksData] = await Promise.all([
          artistService.getArtistById(id),
          artistService.getSimilarArtists(id),
          artistService.getTracksByArtist(id)
        ]);

        setArtist(artistData);
        setSimilarArtists(similarData);
        setTracks(tracksData);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching artist detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  // Sort tracks instantly without reloading or re-fetching
  const sortedTracks = useMemo(() => {
    const list = [...tracks];
    switch (activeTab) {
      case "alphabetical":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "date":
        return list.sort(
          (a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()
        );
      case "popular":
      default:
        return list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
  }, [tracks, activeTab]);

  const handlePlayAll = () => {
    if (sortedTracks.length > 0) {
      playQueue(sortedTracks, 0);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Artist link copied to clipboard!");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const date = new Date();
    const dayMonth = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formattedDate = `${dayMonth} at ${time}`;

    const newComment: CommentItem = {
      id: "c-" + Date.now(),
      author: commentAuthor.trim() || "Anonymous",
      date: formattedDate,
      text: commentText.trim()
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setCommentText("");

    if (typeof window !== "undefined" && id) {
      localStorage.setItem("xitlar_artist_comments_" + id, JSON.stringify(updatedComments));

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
          targetName: `Artist: ${artist?.name || "Unknown Artist"}`,
          text: commentText.trim(),
          date: formattedDate
        };
        userCommentsList = [newUserComment, ...userCommentsList];
        localStorage.setItem("xitlar_user_comments_" + username, JSON.stringify(userCommentsList));
      }
    }
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedTracks.length / ITEMS_PER_PAGE));
  const paginatedTracks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTracks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTracks, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading artist portfolio...</p>
      </div>
    );
  }

  // Proper 404 / Not Found State
  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Artist Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find the artist you are looking for.
        </p>
        <button
          onClick={() => router.push("/artists")}
          className="px-5 py-2 bg-[#365377] text-white font-semibold text-xs rounded-md hover:bg-[#2d4665] transition-colors"
        >
          View All Artists
        </button>
      </div>
    );
  }

  const primaryGenre = artist.genres[0] || "Pop";

  // Determine displayed rating for stars: use hovered value if hovering, else user's vote, else average
  const displayedStarRating = hoveredStar ?? artist.userRating ?? 0;

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Artist Hero Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
        {/* Large Round Avatar */}
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Artist Information & Actions */}
        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            {artist.name}
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            {artist.trackCount || tracks.length} tracks
          </p>

          {/* Genre Tag Badge */}
          {artist.genres.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                #{artist.genres[0]}
              </span>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1 text-xs text-slate-500">
            <div
              className="flex"
              onMouseLeave={() => setHoveredStar(null)}
            >
              {[1, 2, 3, 4, 5].map((index) => {
                const filled = displayedStarRating >= index;
                const isUserVoted = artist.userRating === index && !hoveredStar;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleVote(index)}
                    onMouseEnter={() => setHoveredStar(index)}
                    disabled={votingLoading}
                    className={cn(
                      "p-0.5 transition-all duration-150 focus:outline-none",
                      votingLoading ? "cursor-wait" : "cursor-pointer hover:scale-125",
                    )}
                    aria-label={`Rate ${index} star${index > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "w-4 h-4 transition-colors",
                        filled
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200 fill-slate-200",
                        isUserVoted && "ring-1 ring-amber-400 rounded-sm"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <span className="font-bold text-slate-700">{(artist.rating ?? 0).toFixed(1)}</span>
            <span className="text-slate-400 text-[11px]">(votes: {(artist.votesCount ?? 0).toLocaleString()})</span>
            {artist.userRating && (
              <span className="text-[10px] text-emerald-600 font-semibold ml-1">
                ★ Your vote: {artist.userRating}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-3">
            {/* Play All Yellow Button */}
            <button
              type="button"
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-full transition-colors shadow-xs focus:outline-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </button>

            {/* Add to Favorites */}
            <button
              type="button"
              onClick={() => alert(`Added ${artist.name} to favorites`)}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Add to favorites"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Follow / Verified checkmark button */}
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center transition-colors focus:outline-none",
                isFollowing
                  ? "bg-[#365377] border-[#365377] text-white"
                  : "border-slate-300 hover:border-slate-400 text-slate-600"
              )}
              aria-label={isFollowing ? "Following" : "Follow"}
            >
              <Check className="w-4 h-4" />
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Tracks Section with Tabs */}
      <section className="space-y-4">
        {/* Tabs: POPULAR | ALPHABETICAL | BY DATE */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
          {([
            { key: "popular", label: "POPULAR" },
            { key: "alphabetical", label: "ALPHABETICAL" },
            { key: "date", label: "BY DATE" }
          ] as const).map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={cn(
                "relative pb-2.5 transition-colors focus:outline-none",
                activeTab === tab.key
                  ? "text-amber-500 font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Paginated Tracks display */}
        <TrackList tracks={paginatedTracks} fallbackText="This artist has no tracks in this category." />

        {/* 1. PAGINATION CONTROLS (Matches Box 1) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 pt-4 select-none">
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-600 transition-colors focus:outline-none",
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed bg-slate-50"
                  : "hover:bg-slate-100 hover:border-slate-300"
              )}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                type="button"
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "w-8 h-8 rounded text-xs font-semibold transition-colors flex items-center justify-center border",
                  currentPage === pageNum
                    ? "bg-amber-400 border-amber-400 text-slate-900 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-600 transition-colors focus:outline-none",
                currentPage === totalPages
                  ? "opacity-40 cursor-not-allowed bg-slate-50"
                  : "hover:bg-slate-100 hover:border-slate-300"
              )}
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 2. SIMILAR ARTISTS & POPULAR IN GENRE SECTION (Matches Box 2) */}
      <section className="space-y-4 pt-6 border-t border-slate-100">
        {/* Tabs: SIMILAR | POPULAR [GENRE] */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
          <button
            type="button"
            onClick={() => setRelatedTab("similar")}
            className={cn(
              "relative pb-2.5 transition-colors focus:outline-none",
              relatedTab === "similar"
                ? "text-amber-500 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            SIMILAR
            {relatedTab === "similar" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setRelatedTab("genre")}
            className={cn(
              "relative pb-2.5 transition-colors focus:outline-none",
              relatedTab === "genre"
                ? "text-amber-500 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            POPULAR {primaryGenre.toUpperCase()}
            {relatedTab === "genre" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Similar Artists Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 pt-1">
          {similarArtists.slice(0, 6).map((simArtist) => (
            <Link
              key={simArtist.id}
              href={`/artists/${simArtist.id}`}
              className="group flex flex-col items-center text-center select-none cursor-pointer"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-xs bg-slate-100 mb-2 border border-slate-200/80">
                <img
                  src={simArtist.avatarUrl}
                  alt={simArtist.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-95"
                  loading="lazy"
                />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#365377] transition-colors truncate w-full text-center">
                {simArtist.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. COMMENTS SECTION (Matches Box 3) */}
      <section className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#365377]" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3 max-w-2xl">
          {/* Author Name Input */}
          <input
            type="text"
            placeholder="Your name..."
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#365377] transition-colors"
          />

          {/* Comment Textarea */}
          <textarea
            rows={3}
            placeholder="Leave your comment or thoughts about this artist..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#365377] transition-colors resize-none"
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={cn(
                "inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-xs font-bold transition-all focus:outline-none shadow-xs",
                commentText.trim()
                  ? "bg-[#365377] hover:bg-[#284160] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post comment</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2 max-w-2xl">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800">{comment.author}</span>
                <span className="text-slate-400">{comment.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
