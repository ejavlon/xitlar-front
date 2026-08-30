import { Artist } from "../types/artist";
import { Track } from "../types/track";
import { mockArtists } from "../mock/artists";
import { mockTracks } from "../mock/tracks";
import { api, buildMediaUrl, DEFAULT_AVATAR } from "../lib/api/client";
import { mapMusicToTrack } from "./music.repository";
import { BackendArtistResponse } from "../types/backend";

export interface ArtistRepository {
  getArtists(): Promise<Artist[]>;
  getArtistById(id: string): Promise<Artist | null>;
  getTracksByArtist(artistId: string): Promise<Track[]>;
  searchArtists(query: string): Promise<Artist[]>;
  getSimilarArtists(artistId: string): Promise<Artist[]>;
}

export function mapArtistToArtist(artist: BackendArtistResponse): Artist {
  return {
    id: String(artist.id),
    name: artist.name,
    avatarUrl: artist.image ? buildMediaUrl(artist.image.url) : DEFAULT_AVATAR,
    genres: artist.genre ? [artist.genre.toLowerCase()] : [],
    trackCount: artist.countOfTrack || 0,
    rating: artist.averageRating,
    votesCount: artist.voteCount,
    listenersCount: undefined
  };
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

    const sameGenre = mockArtists.filter(
      (a) => a.id !== artistId && a.genres.some((g) => current.genres.includes(g))
    );

    if (sameGenre.length >= 6) {
      return sameGenre.slice(0, 6);
    }

    const others = mockArtists.filter((a) => a.id !== artistId && !sameGenre.includes(a));
    return [...sameGenre, ...others].slice(0, 6);
  }
}

export class ApiArtistRepository implements ArtistRepository {
  async getArtists(): Promise<Artist[]> {
    const response = await api.get<{ content: BackendArtistResponse[] }>("/api/v1/artists?page=0&size=50");
    const content = response.content || [];
    return content.map(mapArtistToArtist);
  }

  async getArtistById(id: string): Promise<Artist | null> {
    if (!/^\d+$/.test(id)) {
      return null;
    }
    const data = await api.get<BackendArtistResponse>(`/api/v1/artists/${id}`);
    return mapArtistToArtist(data);
  }

  async getTracksByArtist(artistId: string): Promise<Track[]> {
    const response = await api.get<any>("/api/v1/musics?page=0&size=100");
    const content = response.content || [];
    const tracks = content.map(mapMusicToTrack);
    return tracks.filter((t: Track) => t.artist.id === artistId);
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const artists = await this.getArtists();
    return artists.filter(
      (a: Artist) =>
        a.name.toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  async getSimilarArtists(artistId: string): Promise<Artist[]> {
    const current = await this.getArtistById(artistId);
    const allArtists = await this.getArtists();
    if (!current) return allArtists.slice(0, 6);

    const sameGenre = allArtists.filter(
      (a: Artist) => a.id !== artistId && a.genres.some((g) => current.genres.includes(g))
    );

    if (sameGenre.length >= 6) {
      return sameGenre.slice(0, 6);
    }

    const others = allArtists.filter((a: Artist) => a.id !== artistId && !sameGenre.includes(a));
    return [...sameGenre, ...others].slice(0, 6);
  }
}

export const artistRepository: ArtistRepository = new ApiArtistRepository();
