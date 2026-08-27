import { Artist } from "../../types/artist";
import { ArtistCard } from "./artist-card";

interface ArtistGridProps {
  artists: Artist[];
  fallbackText?: string;
}

export function ArtistGrid({ artists, fallbackText = "No artists found" }: ArtistGridProps) {
  if (!artists || artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg bg-slate-50 border border-slate-200/60 w-full">
        <p className="text-slate-500 text-xs sm:text-sm">{fallbackText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-5 w-full">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
}

