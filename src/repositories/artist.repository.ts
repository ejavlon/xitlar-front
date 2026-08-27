import { Artist } from "../types/artist";
import { Track } from "../types/track";
import { mockArtists } from "../mock/artists";
import { mockTracks } from "../mock/tracks";

export interface ArtistRepository {
  getArtists(): Promise<Artist[]>;
  getArtistById(id: string): Promise<Artist | null>;
  getTracksByArtist(artistId: string): Promise<Track[]>;
  searchArtists(query: string): Promise<Artist[]>;
  getSimilarArtists(artistId: string): Promise<Artist[]>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockArtistRepository implements ArtistRepository {
  async getArtists(): Promise<Artist[]> {
    await delay(150);
    return mockArtists;
  }

  async getArtistById(id: string): Promise<Artist | null> {
    await delay(100);
    const artist = mockArtists.find((a) => a.id === id);
    return artist || null;
  }

  async getTracksByArtist(artistId: string): Promise<Track[]> {
    await delay(150);
    return mockTracks.filter((t) => t.artist.id === artistId);
  }

  async searchArtists(query: string): Promise<Artist[]> {
    await delay(150);
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return mockArtists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  async getSimilarArtists(artistId: string): Promise<Artist[]> {
    await delay(150);
    const current = mockArtists.find((a) => a.id === artistId);
    if (!current) return mockArtists.slice(0, 6);

    // Find artists that share at least one genre
    const sameGenre = mockArtists.filter(
      (a) => a.id !== artistId && a.genres.some((g) => current.genres.includes(g))
    );

    if (sameGenre.length >= 6) {
      return sameGenre.slice(0, 6);
    }

    // Fill with remaining other artists
    const others = mockArtists.filter((a) => a.id !== artistId && !sameGenre.includes(a));
    return [...sameGenre, ...others].slice(0, 6);
  }
}

export const artistRepository: ArtistRepository = new MockArtistRepository();
