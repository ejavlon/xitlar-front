import { Track } from "../types/track";
import { Playlist } from "../types/playlist";
import { Genre } from "../types/genre";
import { mockTracks } from "../mock/tracks";
import { mockPlaylists } from "../mock/playlists";
import { mockGenres } from "../mock/genres";

export interface MusicRepository {
  getPopularTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | null>;
  searchTracks(query: string): Promise<Track[]>;
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | null>;
  getGenres(): Promise<Genre[]>;
  getGenreBySlug(slug: string): Promise<Genre | null>;
  getTracksByGenre(genreSlug: string): Promise<Track[]>;
  getPlaylistsByGenre(genreSlug: string): Promise<Playlist[]>;
}

// Simulated delay helper to test loading states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockMusicRepository implements MusicRepository {
  async getPopularTracks(): Promise<Track[]> {
    await delay(200);
    // Sort tracks by likes count descending
    return [...mockTracks].sort((a, b) => b.likesCount - a.likesCount);
  }

  async getTrackById(id: string): Promise<Track | null> {
    await delay(100);
    const track = mockTracks.find((t) => t.id === id);
    return track || null;
  }

  async searchTracks(query: string): Promise<Track[]> {
    await delay(200);
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return mockTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.name.toLowerCase().includes(q) ||
        t.album?.title.toLowerCase().includes(q)
    );
  }

  async getPlaylists(): Promise<Playlist[]> {
    await delay(150);
    return mockPlaylists;
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    await delay(150);
    const playlist = mockPlaylists.find((p) => p.id === id);
    return playlist || null;
  }

  async getGenres(): Promise<Genre[]> {
    await delay(100);
    return mockGenres;
  }

  async getGenreBySlug(slug: string): Promise<Genre | null> {
    await delay(100);
    const genre = mockGenres.find((g) => g.slug === slug);
    return genre || null;
  }

  async getTracksByGenre(genreSlug: string): Promise<Track[]> {
    await delay(150);
    return mockTracks.filter((t) => t.artist.genres.includes(genreSlug));
  }

  async getPlaylistsByGenre(genreSlug: string): Promise<Playlist[]> {
    await delay(150);
    // Return mock playlists where any track has the given genre,
    // or if the playlist description/title mentions the genre.
    return mockPlaylists.filter((p) => {
      const hasGenreTrack = p.tracks?.some((t) => t.artist.genres.includes(genreSlug));
      const titleMatches = p.title.toLowerCase().includes(genreSlug.toLowerCase());
      return hasGenreTrack || titleMatches;
    });
  }
}

// Export the active repository instance (currently mock, swap to API repository later)
export const musicRepository: MusicRepository = new MockMusicRepository();
