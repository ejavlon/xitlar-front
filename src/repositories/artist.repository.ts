import { Artist } from "../types/artist";
import { Track } from "../types/track";
import { api, buildMediaUrl, DEFAULT_AVATAR } from "../lib/api/client";
import { mapMusicToTrack } from "./music.repository";
import { BackendArtistResponse } from "../types/backend";

export interface ArtistRepository {
  getArtists(): Promise<Artist[]>;
  getFollowedArtists(): Promise<Artist[]>;
  toggleFollowArtist(artistId: string): Promise<Artist>;
  getArtistById(id: string): Promise<Artist | null>;
  getTracksByArtist(artistId: string): Promise<Track[]>;
  searchArtists(query: string): Promise<Artist[]>;
  getSimilarArtists(artistId: string): Promise<Artist[]>;
  voteArtist(artistId: string, rating: number): Promise<Artist | null>;
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
    userRating: artist.userRating,
    isFollowed: artist.isFollowed ?? false,
    listenersCount: undefined
  };
}

export class ApiArtistRepository implements ArtistRepository {
  async getArtists(): Promise<Artist[]> {
    const response = await api.get<{ content: BackendArtistResponse[] }>("/api/v1/artists?page=0&size=50");
    const content = response.content || [];
    return content.map(mapArtistToArtist);
  }

  async getFollowedArtists(): Promise<Artist[]> {
    try {
      const data = await api.get<BackendArtistResponse[]>("/api/v1/artists/followed");
      return Array.isArray(data) ? data.map(mapArtistToArtist) : [];
    } catch {
      return [];
    }
  }

  async toggleFollowArtist(artistId: string): Promise<Artist> {
    const data = await api.post<BackendArtistResponse>(`/api/v1/artists/${artistId}/follow`);
    return mapArtistToArtist(data);
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

  async voteArtist(artistId: string, rating: number): Promise<Artist | null> {
    const data = await api.post<BackendArtistResponse>(`/api/v1/artists/${artistId}/vote`, { rating });
    return mapArtistToArtist(data);
  }
}

export const artistRepository: ArtistRepository = new ApiArtistRepository();
