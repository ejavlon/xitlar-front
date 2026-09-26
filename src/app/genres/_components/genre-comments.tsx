"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/auth-store";

interface CommentItem {
  id: string;
  author: string;
  date: string;
  text: string;
}

export function GenreComments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState("Anonymous");
  const [commentText, setCommentText] = useState("");

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      setAuthorName(
        user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username
      );
    } else {
      setAuthorName("Anonymous");
    }
  }, [user]);

  // localStorage dan commentlarni yuklash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("xitlar_genre_comments");
      if (stored) {
        try {
          setComments(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse comments", e);
        }
      }
    }
  }, []);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const date = new Date();
    const dayMonth = date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const formattedDate = `${dayMonth} at ${time}`;

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: authorName.trim() || "Anonymous",
      date: formattedDate,
      text: commentText.trim(),
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setCommentText("");

    if (typeof window !== "undefined") {
      localStorage.setItem("xitlar_genre_comments", JSON.stringify(updatedComments));

      if (user) {
        const username = user.username;
        const stored = localStorage.getItem("xitlar_user_comments_" + username);
        let userCommentsList: any[] = [];
        if (stored) {
          try {
            userCommentsList = JSON.parse(stored);
          } catch {}
        }
        userCommentsList = [
          { id: "uc-" + Date.now(), targetName: "Genres page comments", text: commentText.trim(), date: formattedDate },
          ...userCommentsList,
        ];
        localStorage.setItem("xitlar_user_comments_" + username, JSON.stringify(userCommentsList));
      }
    }
  };

  return (
    <section className="space-y-4 pt-8 border-t border-slate-100">
      <h3 className="text-base font-bold text-slate-900 tracking-tight">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-2.5 max-w-xl">
        <div>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-full sm:w-64 px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400 bg-white shadow-2xs"
          />
        </div>
        <div>
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Leave a comment about these genres..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400 bg-white shadow-2xs resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="px-5 py-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-900 text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-2xs cursor-pointer focus:outline-none"
        >
          Send
        </button>
      </form>

      {/* Comments Feed */}
      <div className="space-y-3 pt-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1 text-xs"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-800">{c.author}</span>
              <span className="text-[11px]">{c.date}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
