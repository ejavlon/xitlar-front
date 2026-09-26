// Server Component — foydalanuvchi playlists (isCollection=false)
import type { Metadata } from "next";
import { musicService } from "../../services/music.service";
import { PlaylistsClient } from "./_components/playlists-client";

export const metadata: Metadata = {
  title: "Playlists | Xitlar.net",
  description: "Foydalanuvchilar tomonidan yaratilgan shaxsiy playlist to'plamlari"
};

export default async function PlaylistsPage() {
  // Barcha playlistlarni olamiz va isCollection=false larini filtrlaymiz
  const allPlaylists = await musicService.getPlaylists();
  const userPlaylists = allPlaylists.filter((p) => !p.isCollection);

  return (
    <div className="space-y-6 select-none">
      <PlaylistsClient initialPlaylists={userPlaylists} />
    </div>
  );
}
