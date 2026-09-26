// Server Component — pre-fetches artists & genres on server
import type { Metadata } from "next";
import { artistService } from "../../services/artist.service";
import { musicService } from "../../services/music.service";
import { ArtistsClient } from "./_components/artists-client";

export const metadata: Metadata = {
  title: "All Artists | Xitlar.net",
  description: "Discover popular artists and performers"
};

export default async function ArtistsPage() {
  const [artists, genres] = await Promise.all([
    artistService.getArtists(),
    musicService.getGenres()
  ]);

  return (
    <div className="space-y-6 select-none">
      <ArtistsClient initialArtists={artists} initialGenres={genres} />
    </div>
  );
}
