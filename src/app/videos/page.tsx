"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { mockVideos } from "../../mock/videos";
import { MusicVideo } from "../../types/video";
import { formatDuration } from "../../lib/formatters";
import { usePlayerStore } from "../../stores/player-store";
import {
  Play,
  Share2,
  ChevronDown,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal
} from "lucide-react";
import { cn } from "../../lib/utils";

type VideoCategory = "all" | "international" | "russian" | "uzbek" | "kazakh";

export default function MusicVideosPage() {
  const [videos] = useState<MusicVideo[]>(mockVideos);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("all");
  const [activeVideo, setActiveVideo] = useState<MusicVideo | null>(null);
  const [mounted, setMounted] = useState(false);

  const { pause: pauseAudioPlayer, isPlaying: isAudioPlaying } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const handleOpenVideo = (video: MusicVideo) => {
    if (isAudioPlaying) pauseAudioPlayer();
    setActiveVideo(video);
  };

  const handleCloseVideo = () => setActiveVideo(null);

  const handleNextVideo = () => {
    if (!activeVideo) return;
    const idx = videos.findIndex((v) => v.id === activeVideo.id);
    setActiveVideo(videos[(idx + 1) % videos.length]);
  };

  const handlePrevVideo = () => {
    if (!activeVideo) return;
    const idx = videos.findIndex((v) => v.id === activeVideo.id);
    setActiveVideo(videos[(idx - 1 + videos.length) % videos.length]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-6 select-none animate-fade-in font-sans">
      {/* FIXED CENTERED OVERLAY VIDEO PLAYER (PORTAL TO BODY) */}
      {mounted && activeVideo && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={handleCloseVideo}>
          <div className="relative w-full max-w-[1300px] h-[620px] max-h-[90vh] bg-[#121214] border border-slate-700/80 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl select-none" onClick={(e) => e.stopPropagation()}>
            {/* YouTube Video (Left) */}
            <div className="flex-1 h-[280px] md:h-full bg-black relative">
              <iframe
                key={activeVideo.youtubeId}
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${activeVideo.artistName} - ${activeVideo.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>

            {/* Right Sidebar Playlist */}
            <div className="w-full md:w-72 lg:w-80 h-full bg-[#18181b] border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0">
              {/* Header */}
              <div className="h-10 px-3 flex items-center justify-between border-b border-white/10 shrink-0 text-white/80 bg-[#141416]">
                <div className="flex items-center gap-1 min-w-0">
                  <button onClick={handlePrevVideo} className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer" aria-label="Previous video">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleNextVideo} className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer" aria-label="Next video">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-white/80 ml-1 truncate">Videos ({videos.length})</span>
                </div>
                <button onClick={handleCloseVideo} className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Track List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-1.5 no-scrollbar">
                {videos.map((item) => {
                  const isActive = item.id === activeVideo.id;
                  return (
                    <div
                      key={`q-${item.id}`}
                      onClick={() => setActiveVideo(item)}
                      className={cn(
                        "group flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors",
                        isActive ? "bg-white/15 text-white" : "hover:bg-white/5 text-white/80"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="relative w-14 aspect-video rounded overflow-hidden bg-slate-800 shrink-0">
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                          {isActive && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-3 h-3 text-amber-400 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-bold truncate text-white group-hover:text-amber-400 transition-colors leading-tight">{item.artistName}</h4>
                          <p className="text-[10px] text-white/60 truncate mt-0.5 leading-tight">{item.title}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
                        aria-label="Add to playlist"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">New Music Videos</h1>
        <button
          onClick={() => { if (navigator.share) { navigator.share({ title: "New Music Videos - Xitlar", url: window.location.href }); } else { alert("Link copied!"); } }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>share on social networks</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-5 sm:gap-6 border-b border-slate-100 pb-0 overflow-x-auto no-scrollbar">
        {([
          { key: "all" as VideoCategory, label: "ALL" },
          { key: "international" as VideoCategory, label: "INTERNATIONAL" },
          { key: "russian" as VideoCategory, label: "RUSSIAN" },
          { key: "uzbek" as VideoCategory, label: "UZBEK" },
          { key: "kazakh" as VideoCategory, label: "KAZAKH" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={cn(
              "relative pb-2.5 text-xs sm:text-sm font-bold tracking-wide transition-colors whitespace-nowrap",
              selectedCategory === tab.key ? "text-amber-500 font-extrabold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
            {selectedCategory === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* VIDEOS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} onClick={() => handleOpenVideo(video)} className="group flex flex-col space-y-2 cursor-pointer">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white tracking-wider rounded">HD</span>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-[11px] font-medium text-white rounded">{formatDuration(video.duration, true)}</span>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between gap-2 px-0.5">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#365377] transition-colors leading-snug">{video.artistName}</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5 leading-snug">{video.title}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">{video.releaseDate}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); }} className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors" aria-label="More actions">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
