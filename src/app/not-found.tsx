import Link from "next/link";
import { Disc, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#8b5cf6]/20 to-[#ec4899]/20 border border-white/10 flex items-center justify-center mb-6 glow-primary">
        <Disc className="w-10 h-10 text-[#a78bfa] animate-spin-slow" />
      </div>

      <span className="text-xs uppercase font-bold tracking-widest text-[#a78bfa] bg-[#8b5cf6]/10 px-3 py-1 rounded-full border border-[#8b5cf6]/20 mb-3">
        404 &bull; Page Not Found
      </span>

      <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
        Lost in the Groove?
      </h1>

      <p className="text-sm text-gray-400 max-w-md mb-8">
        The page, track, or artist you are looking for does not exist or has been moved to another frequency.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-lg glow-primary"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search Xitlar</span>
        </Link>
      </div>
    </div>
  );
}
