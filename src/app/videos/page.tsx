"use client";

import { AlertCircle } from "lucide-react";

export default function MusicVideosPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center font-sans select-none animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 shadow-2xs border border-slate-200">
        <AlertCircle className="w-6 h-6 text-slate-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Not Implemented</h1>
      <p className="text-xs text-slate-500 max-w-[360px] leading-relaxed">
        Music video catalog and playback features are currently not implemented by the backend.
      </p>
    </div>
  );
}
