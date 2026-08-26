"use client";

import { Track } from "../../types/track";
import { TrackRow } from "./track-row";

interface TrackListProps {
  tracks: Track[];
  fallbackText?: string;
}

export function TrackList({ tracks, fallbackText = "No tracks available" }: TrackListProps) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg bg-slate-50 border border-slate-200/60">
        <p className="text-slate-500 text-xs sm:text-sm">{fallbackText}</p>
      </div>
    );
  }

  return (
    <div className="w-full divide-y divide-slate-100">
      {tracks.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          playlistTracks={tracks}
        />
      ))}
    </div>
  );
}

