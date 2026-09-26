// Server Component — pre-fetches popular & latest tracks on server
import type { Metadata } from "next";
import { musicService } from "../../services/music.service";
import { NewReleasesClient } from "./_components/new-releases-client";

export const metadata: Metadata = {
  title: "New Music | Xitlar.Uz",
  description: "Siz izlagan xitlar olami!"
};

export default async function NewReleasesPage() {
  const [popular, allTracks] = await Promise.all([
    musicService.getPopularTracks(),
    musicService.searchTracks("")
  ]);

  const combined = [...popular];
  allTracks.forEach((t) => {
    if (!combined.find((c) => c.id === t.id)) {
      combined.push(t);
    }
  });

  // Sort by release date (newest first)
  combined.sort((a, b) => {
    const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-5 select-none animate-fade-in font-sans">
      {/* Static Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          New Music
        </h1>
      </div>

      {/* Interactive Tabs & List */}
      <NewReleasesClient initialTracks={combined} />
    </div>
  );
}
