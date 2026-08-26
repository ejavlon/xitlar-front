"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, ChevronDown } from "lucide-react";

const allGenresList = [
  { name: "pop", slug: "pop" },
  { name: "club", slug: "club" },
  { name: "chanson", slug: "chanson" },
  { name: "rap", slug: "rap" },
  { name: "rock", slug: "rock" },
  { name: "trance", slug: "trance" },
  { name: "dance", slug: "dance" },
  { name: "relax", slug: "relax" },
  { name: "dubstep", slug: "dubstep" },
  { name: "house", slug: "house" },
  { name: "metal", slug: "metal" },
  { name: "classical", slug: "classical" },
  { name: "r'n'b", slug: "rnb" },
  { name: "electronic", slug: "electronic" },
  { name: "instrumental", slug: "instrumental" },
  { name: "jazz", slug: "jazz" },
  { name: "blues", slug: "blues" },
  { name: "acoustic", slug: "acoustic" },
  { name: "techno", slug: "techno" },
  { name: "drum & bass", slug: "drum-bass" },
  { name: "alternative", slug: "alternative" },
  { name: "ethnic", slug: "ethnic" },
  { name: "indie", slug: "indie" },
  { name: "reggae", slug: "reggae" },
  { name: "soundtracks", slug: "soundtracks" },
  { name: "k-pop", slug: "k-pop" },
  { name: "j-pop", slug: "j-pop" },
  { name: "breakbeat", slug: "breakbeat" },
  { name: "phonk", slug: "phonk" },
  { name: "rave", slug: "rave" },
  { name: "edm", slug: "edm" },
  { name: "trap", slug: "trap" },
  { name: "hardstyle", slug: "hardstyle" },
  { name: "swing", slug: "swing" },
  { name: "chillout", slug: "chillout" },
  { name: "lounge", slug: "lounge" },
  { name: "estrada", slug: "estrada" },
  { name: "country", slug: "country" },
  { name: "old funk", slug: "old-funk" },
  { name: "soul", slug: "soul" },
  { name: "ska", slug: "ska" },
  { name: "nu disco", slug: "nu-disco" },
  { name: "dream dance", slug: "dream-dance" },
  { name: "eurodance", slug: "eurodance" },
  { name: "synthwave", slug: "synthwave" },
  { name: "italo disco", slug: "italo-disco" },
  { name: "darkwave", slug: "darkwave" },
  { name: "screamo", slug: "screamo" },
  { name: "vaporwave", slug: "vaporwave" },
  { name: "8-bit", slug: "8-bit" },
  { name: "noise", slug: "noise" },
  { name: "acid", slug: "acid" },
  { name: "lo-fi", slug: "lo-fi" },
  { name: "trip-hop", slug: "trip-hop" },
  { name: "electropop", slug: "electropop" },
  { name: "synthpop", slug: "synthpop" },
  { name: "romances", slug: "romances" },
  { name: "reggaeton", slug: "reggaeton" },
  { name: "guitar gloom", slug: "guitar-gloom" },
  { name: "vocal", slug: "vocal" },
  { name: "bollywood", slug: "bollywood" },
  { name: "bebop", slug: "bebop" },
  { name: "easy listening", slug: "easy-listening" },
];

interface CommentItem {
  id: string;
  author: string;
  date: string;
  text: string;
}

export default function GenresPage() {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "c1",
      author: "Alexey",
      date: "12 Aug 2026",
      text: "Great genre catalog! Very easy to discover new tracks.",
    },
    {
      id: "c2",
      author: "Elena_Music",
      date: "20 Aug 2026",
      text: "Synthwave and Lo-Fi sections are pure fire 🔥",
    },
  ]);

  const [authorName, setAuthorName] = useState("Javlon");
  const [commentText, setCommentText] = useState("");

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: authorName.trim() || "Anonymous",
      date: "Today",
      text: commentText.trim(),
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  return (
    <div className="space-y-7 select-none animate-fade-in font-sans">
      {/* 1. HEADER SECTION (Matching Sefon Screenshot) */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Music by Genres
        </h1>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "Music by Genres - Xitlar", url: window.location.href });
            } else {
              alert("Link copied to clipboard!");
            }
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>share on social networks</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* 2. GENRES GRID (6 Columns of Pill Buttons - Matching Sefon Screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {allGenresList.map((genre) => (
          <Link
            key={genre.slug}
            href={`/genres/${genre.slug}`}
            className="h-10 sm:h-11 px-2.5 flex items-center justify-center rounded-[8px] bg-[#edf2f7] hover:bg-[#dde5ef] text-[#334155] hover:text-slate-900 border border-[#d9e2ec] hover:border-[#cbd5e1] font-medium text-[13px] sm:text-[14px] transition-all text-center select-none truncate hover:shadow-2xs"
          >
            {genre.name}
          </Link>
        ))}
      </div>

      {/* 3. COMMENTS SECTION (Matching Sefon Screenshot) */}
      <section className="space-y-4 pt-8 border-t border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Comments
        </h3>

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
    </div>
  );
}
