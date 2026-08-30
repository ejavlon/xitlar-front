"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Track } from "../../../types/track";
import { musicService } from "../../../services/music.service";
import { artistService } from "../../../services/artist.service";
import { usePlayerStore } from "../../../stores/player-store";
import { useAuthStore } from "../../../stores/auth-store";
import { api } from "../../../lib/api/client";
import { TrackRow } from "../../../components/music/track-row";
import { AddToPlaylistPopover } from "../../../components/player/add-to-playlist-popover";
import {
  Play,
  Pause,
  Download,
  Plus,
  ArrowLeft,
  MessageSquare,
  Send,
  Loader
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  formatDuration,
  formatReleaseDate,
  formatBitrate,
  formatNumber
} from "../../../lib/formatters";

interface BackendCommentResponse {
  id: number;
  text: string;
  createdAt: string;
  musicId: number;
  userId: number;
  userName: string;
}

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullLyrics, setShowFullLyrics] = useState(false);

  // Comments states
  const [comments, setComments] = useState<BackendCommentResponse[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  const user = useAuthStore((s) => s.user);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const isCurrent = usePlayerStore((s) => s.currentTrack?.id === track?.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying && s.currentTrack?.id === track?.id);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    const fetchTrackData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const trackData = await musicService.getTrackById(id);
        if (trackData) {
          setTrack(trackData);

          // Fetch other tracks by this artist
          const artistTracks = await artistService.getTracksByArtist(trackData.artist.id);
          // Exclude the current track and limit to 5
          setPopularTracks(artistTracks.filter((t) => t.id !== id).slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching track data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      try {
        setCommentsLoading(true);
        // Page 0, Size 50, Sort by id desc to show newest comments first
        const res = await api.get<{ content: BackendCommentResponse[] }>(
          `/api/v1/comments/music/${id}?page=0&size=50&sortBy=id&sortDirection=desc`
        );
        setComments(res.content || []);
      } catch (err) {
        console.error("Failed to fetch track comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  const handlePlayClick = () => {
    if (!track) return;
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, [track]);
    }
  };

  const handleDownload = () => {
    if (typeof window !== "undefined" && track) {
      const link = document.createElement("a");
      link.href = track.audioUrl;
      link.setAttribute("download", `${track.artist.name} - ${track.title}.${track.format || 'mp3'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      alert("Please log in to submit a comment.");
      router.push("/login");
      return;
    }

    try {
      const newComment = await api.post<BackendCommentResponse>("/api/v1/comments", {
        text: commentText.trim(),
        musicId: Number(id)
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      alert(err.message || "Failed to post comment.");
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const dayMonth = date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
      const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      return `${dayMonth} at ${time}`;
    } catch (e) {
      return "Just now";
    }
  };

  // Dynamic values based on track metadata
  const fileSizeMB = useMemo(() => {
    if (!track) return "7.4 MB";
    const bitrate = track.bitrate || 320;
    return `${((track.duration * (bitrate * 1000)) / 8 / 1024 / 1024).toFixed(1)} MB`;
  }, [track]);

  const simulatedViews = useMemo(() => {
    if (!track) return "1,025,442";
    return (track.likesCount * 142 + 25000).toLocaleString();
  }, [track]);

  const tags = useMemo(() => {
    const list = [];
    if (track?.artist.genres && track.artist.genres.length > 0) {
      list.push(`#${track.artist.genres[0].toLowerCase()}`);
    }
    if (track?.releaseDate) {
      const year = new Date(track.releaseDate).getFullYear();
      if (!isNaN(year)) {
        list.push(`#${year}`);
      }
    }
    return list;
  }, [track]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Loader className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading song details...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Song Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          We couldn&apos;t find the song you are looking for.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2 bg-[#365377] text-white font-semibold text-xs rounded-md hover:bg-[#2d4665] transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  const commentAuthorName = user
    ? user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
    : "Anonymous";

  return (
    <div className="space-y-8 select-none pb-12 font-sans">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Song Header & Details Card (Matches Box 1 layout) */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {track.artist.name} - {track.title}
        </h1>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl text-xs sm:text-[13px] text-slate-600">
          <div className="space-y-2.5">
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-slate-400 w-28 shrink-0">Date added:</span>
              <span className="font-semibold text-slate-800">
                {formatReleaseDate(track.releaseDate)}
              </span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-slate-400 w-28 shrink-0">Format:</span>
              <span className="font-semibold text-slate-800">
                {track.format?.toUpperCase() || "MP3"}
              </span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-slate-400 w-28 shrink-0">Bitrate:</span>
              <span className="font-semibold text-slate-800">
                {formatBitrate(track.bitrate) || "320 kbps"}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-slate-400 w-28 shrink-0">Size:</span>
              <span className="font-semibold text-slate-800">{fileSizeMB}</span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-slate-400 w-28 shrink-0">Duration:</span>
              <span className="font-semibold text-slate-800">
                {formatDuration(track.duration, true)}
              </span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-slate-400 w-28 shrink-0">Views:</span>
              <span className="font-semibold text-slate-800">{simulatedViews}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Genre/Year Badges */}
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap select-none pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          {/* Yellow Listen Button */}
          <button
            type="button"
            onClick={handlePlayClick}
            className="flex items-center gap-2 px-6 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-full transition-all shadow-xs focus:outline-none active:scale-[0.98]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-full transition-all shadow-xs focus:outline-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Add to Playlist Popover */}
          <AddToPlaylistPopover track={track} triggerSize="md" />
        </div>
      </section>

      {/* Lyrics Section */}
      {track.lyrics && track.lyrics.text && (
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Lyrics
          </h2>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden">
            <div
              className={cn(
                "text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed select-text font-medium text-center md:text-left transition-all duration-300",
                !showFullLyrics && track.lyrics.text.split("\n").length > 10
                  ? "max-h-48 overflow-hidden"
                  : "max-h-none"
              )}
            >
              {track.lyrics.text}
            </div>

            {!showFullLyrics && track.lyrics.text.split("\n").length > 10 && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent rounded-b-2xl flex items-end justify-center pb-4">
                <button
                  type="button"
                  onClick={() => setShowFullLyrics(true)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors border border-slate-200/80 shadow-xs focus:outline-none"
                >
                  Show full lyrics
                </button>
              </div>
            )}

            {showFullLyrics && track.lyrics.text.split("\n").length > 10 && (
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowFullLyrics(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors border border-slate-200/80 shadow-xs focus:outline-none"
                >
                  Show less
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Songs Section */}
      {popularTracks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Popular Songs
          </h2>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
            <div className="divide-y divide-slate-100">
              {popularTracks.map((popTrack, idx) => (
                <TrackRow
                  key={popTrack.id}
                  track={popTrack}
                  index={idx}
                  playlistTracks={popularTracks}
                />
              ))}
            </div>

            <div className="pt-4 flex justify-start">
              <button
                type="button"
                onClick={() => router.push(`/artists/${track.artist.id}`)}
                className="px-5 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-lg transition-colors focus:outline-none"
              >
                View all
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Backend Comments Section (Matches Box 2 layout) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-[#365377]" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <form
          onSubmit={handleCommentSubmit}
          className="space-y-3.5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 max-w-2xl"
        >
          {/* Author Name Input */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              readOnly
              value={commentAuthorName}
              placeholder="Your name"
              className="w-full h-9 px-3 text-xs bg-slate-100/50 border border-slate-300 rounded-lg text-slate-500 placeholder:text-slate-400 focus:outline-none focus:border-[#365377] select-none cursor-not-allowed"
            />
          </div>

          {/* Comment Textarea */}
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Your comment"
            className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#365377] resize-none"
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={cn(
                "px-6 py-2 text-xs font-bold rounded-lg transition-colors focus:outline-none shadow-xs flex items-center gap-1.5",
                commentText.trim()
                  ? "bg-[#365377] hover:bg-[#2d4665] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>

        {/* Comments Feed */}
        <div className="space-y-3 pt-2 max-w-2xl">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader className="w-4 h-4 text-[#365377] animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{comment.userName}</span>
                  <span className="text-[11px] text-slate-400">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 border border-slate-100 rounded-2xl">
              No comments posted yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
