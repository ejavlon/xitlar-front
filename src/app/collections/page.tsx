// Server Component — header renders on server, data pre-fetched without client spinner
import type { Metadata } from "next";
import { musicService } from "../../services/music.service";
import { CollectionsClient } from "./_components/collections-client";

export const metadata: Metadata = {
  title: "Library & Collections | Xitlar.net",
  description: "Curated music selections and user playlists"
};

export default async function CollectionsPage() {
  const playlists = await musicService.getPlaylists();

  return (
    <div className="space-y-6 select-none">
      {/* Static Server Header */}
      <div className="pb-2 border-b border-slate-100">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Library & Collections
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Curated music selections and user playlists
        </p>
      </div>

      {/* Interactive Client Island */}
      <CollectionsClient initialPlaylists={playlists} />
    </div>
  );
}
