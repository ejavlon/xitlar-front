// Server Component — "use client" yo'q
// allGenresList static data → server side render, hydration yo'q
import Link from "next/link";
import { Share2, ChevronDown } from "lucide-react";
import { GenreComments } from "./_components/genre-comments";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music by Genres — Xitlar",
  description: "Browse and discover music by genres on Xitlar.",
};

// Statik data — server side da render bo'ladi, JS bundle yuklamaydi
const ALL_GENRES = [
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
] as const;

export default function GenresPage() {
  return (
    <div className="space-y-7 select-none animate-fade-in font-sans">
      {/* Page Header — pure server render */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Music by Genres
        </h1>       
      </div>

      {/* Genre Grid — 100% static, server render, zero JS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {ALL_GENRES.map((genre) => (
          <Link
            key={genre.slug}
            href={`/genres/${genre.slug}`}
            className="h-10 sm:h-11 px-2.5 flex items-center justify-center rounded-[8px] bg-[#edf2f7] hover:bg-[#dde5ef] text-[#334155] hover:text-slate-900 border border-[#d9e2ec] hover:border-[#cbd5e1] font-medium text-[13px] sm:text-[14px] transition-all text-center select-none truncate hover:shadow-2xs"
          >
            {genre.name}
          </Link>
        ))}
      </div>

      {/* GenreComments — Client Component (localStorage + form state) */}
      <GenreComments />
    </div>
  );
}
