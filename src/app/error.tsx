"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>

      <span className="text-xs uppercase font-bold tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mb-3">
        System Interruption
      </span>

      <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
        Something went wrong
      </h1>

      <p className="text-sm text-gray-400 max-w-md mb-8">
        An unexpected error occurred while loading this audio stream. We apologize for the inconvenience.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-lg glow-primary focus:outline-none"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
