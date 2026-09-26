// Server Component — pre-fetches playlists on server
import type { Metadata } from "next";
import { musicService } from "../../services/music.service";
import { PlaylistsClient } from "./_components/playlists-client";

export const metadata: Metadata = {
  title: "Playlists & Compilations | Xitlar.net",
  description: "Curated playlists for every mood and moment"
};

export default async function PlaylistsPage() {
  const playlists = await musicService.getPlaylists();

  return (
    <div className="space-y-6 select-none">
      <PlaylistsClient initialPlaylists={playlists} />
    </div>
  );
}
