import Link from "next/link";
import { Genre } from "../../types/genre";

interface GenrePillProps {
  genre: Genre;
}

export function GenrePill({ genre }: GenrePillProps) {
  return (
    <Link
      href={`/genres/${genre.slug}`}
      className="px-4 py-2.5 rounded-xl border border-white/5 bg-[#121215]/80 hover:bg-[#1a1a22] hover:border-[#8b5cf6]/40 text-gray-300 hover:text-white transition-all duration-200 text-sm font-semibold select-none flex items-center justify-center text-center shadow-sm hover:scale-[1.03]"
    >
      <span>{genre.name}</span>
    </Link>
  );
}
