import { Track } from "../types/track";
import { Playlist } from "../types/playlist";
import { Genre } from "../types/genre";
import { api, buildMediaUrl, DEFAULT_AVATAR, DEFAULT_PLAYLIST_COVER } from "../lib/api/client";
import { BackendMusicResponse, BackendPlaylistResponse, BackendPlaylistMusicResponse } from "../types/backend";

export interface MusicRepository {
  getPopularTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | null>;
  searchTracks(query: string): Promise<Track[]>;
  getPlaylists(): Promise<Playlist[]>;
  getUserPlaylists(): Promise<Playlist[]>;
  getCollections(): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | null>;
  getPlaylistsByTag(tagName: string): Promise<Playlist[]>;
  votePlaylist(playlistId: string, rating: number): Promise<Playlist>;
  getGenres(): Promise<Genre[]>;
  getGenreBySlug(slug: string): Promise<Genre | null>;
  getTracksByGenre(genreSlug: string): Promise<Track[]>;
  getPlaylistsByGenre(genreSlug: string): Promise<Playlist[]>;
  likeTrack(id: string): Promise<Track>;
  dislikeTrack(id: string): Promise<Track>;
  getLikedTracks(): Promise<Track[]>;
}

// Fallback genres if backend is unreachable
const DEFAULT_GENRES: Genre[] = [
  { id: "pop", name: "Pop", slug: "pop", description: "Mashhur pop qo'shiqlar va xitlar" },
  { id: "rap", name: "Rap", slug: "rap", description: "Hiphop va rep yo'nalishidagi treklar" },
  { id: "rock", name: "Rock", slug: "rock", description: "Klassik va zamonaviy rok musiqasi" },
  { id: "hip_hop", name: "Hip-Hop", slug: "hip_hop", description: "Hip-Hop va bitlar" },
  { id: "electronic", name: "Electronic", slug: "electronic", description: "Elektron va raqs musiqasi" },
  { id: "jazz", name: "Jazz", slug: "jazz", description: "Klassik va zamonaviy jazz musiqasi" },
  { id: "classical", name: "Classical", slug: "classical", description: "Klassik va simfonik kompozitsiyalar" },
  { id: "r_and_b", name: "R&B", slug: "r_and_b", description: "R&B va soul treklari" },
  { id: "k_pop", name: "K-Pop", slug: "k_pop", description: "K-Pop xitlari" },
  { id: "other", name: "Boshqa", slug: "other", description: "Boshqa turli xil janrlar" }
];

// Map backend MusicResponse to frontend Track
export function mapMusicToTrack(music: BackendMusicResponse): Track {
  const genres: string[] = [];
  if (music.genre) {
    const g = String(music.genre).toLowerCase();
    genres.push(g);
    genres.push(g.replace(/_/g, ""));
    genres.push(g.replace(/_/g, "-"));
  }
  if (music.artist && music.artist.genre) {
    const ag = String(music.artist.genre).toLowerCase();
    genres.push(ag);
    genres.push(ag.replace(/_/g, ""));
    genres.push(ag.replace(/_/g, "-"));
  }

  return {
    id: String(music.id),
    title: music.title,
    artist: {
      id: music.artist ? String(music.artist.id) : "",
      name: music.artist ? music.artist.name : "",
      avatarUrl: music.artist && music.artist.image ? buildMediaUrl(music.artist.image.url) : DEFAULT_AVATAR,
      genres: Array.from(new Set(genres)),
      trackCount: music.artist ? music.artist.countOfTrack : 0,
      listenersCount: undefined
    },
    album: music.album ? {
      id: String(music.album.id),
      title: music.album.title,
      coverUrl: music.album.image ? buildMediaUrl(music.album.image.url) : "",
      releaseDate: ""
    } : undefined,
    coverUrl: music.album && music.album.image
      ? buildMediaUrl(music.album.image.url)
      : (music.artist && music.artist.image ? buildMediaUrl(music.artist.image.url) : ""),
    audioUrl: music.audioUrl ? buildMediaUrl(music.audioUrl) : `/api/v1/musics/${music.id}/audio`,
    duration: music.duration || 0,
    releaseDate: music.addedDate ? music.addedDate.split("T")[0] : "",
    likesCount: music.likeCount || 0,
    dislikesCount: music.dislikeCount || 0,
    isLiked: music.isLiked ?? false,
    isDisliked: music.isDisliked ?? false,
    bitrate: music.bitrate,
    sampleRate: music.sampleRate,
    format: music.audioFormat ? (music.audioFormat.toLowerCase() as any) : "mp3",
    lyrics: music.lyrics ? {
      id: music.lyrics.id,
      text: music.lyrics.text,
      language: music.lyrics.language,
      isSynced: music.lyrics.isSynced,
      lrcContent: music.lyrics.lrcContent
    } : undefined
  };
}

// Map backend PlaylistResponse to frontend Playlist
export function mapPlaylistToPlaylist(playlist: BackendPlaylistResponse): Playlist {
  return {
    id: String(playlist.id),
    title: playlist.title,
    tagName: playlist.tagName || "playlists",
    description: playlist.description || "",
    coverUrl: playlist.image ? buildMediaUrl(playlist.image.url) : DEFAULT_PLAYLIST_COVER,
    trackCount: playlist.trackCount ?? (playlist.musics ? playlist.musics.length : 0),
    voteCount: playlist.voteCount ?? 0,
    averageRating: playlist.averageRating ?? 0.0,
    userRating: playlist.userRating,
    createdAt: playlist.createdAt,
    tracks: playlist.musics ? playlist.musics.map((pm: BackendPlaylistMusicResponse) => mapMusicToTrack(pm as any)) : [],
    isCollection: playlist.isCollection ?? false,
    creator: playlist.createdBy ? `${playlist.createdBy.firstName || ""} ${playlist.createdBy.lastName || ""}`.trim() || playlist.createdBy.username : undefined
  };
}

export class ApiMusicRepository implements MusicRepository {
  async getPopularTracks(): Promise<Track[]> {
    try {
      const response = await api.get<{ content: BackendMusicResponse[] }>("/api/v1/musics?page=0&size=50&sortBy=likes&sortDirection=desc");
      const content = response.content || [];
      return content.map(mapMusicToTrack);
    } catch {
      return [];
    }
  }

  async getTrackById(id: string): Promise<Track | null> {
    if (!/^\d+$/.test(id)) {
      return null;
    }
    try {
      const data = await api.get<BackendMusicResponse>(`/api/v1/musics/${id}`);
      return mapMusicToTrack(data);
    } catch {
      return null;
    }
  }

  async searchTracks(query: string): Promise<Track[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    try {
      const response = await api.get<{ content: BackendMusicResponse[] }>(`/api/v1/musics/search?query=${encodeURIComponent(q)}&page=0&size=50`);
      const content = response.content || [];
      return content.map(mapMusicToTrack);
    } catch {
      return [];
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const response = await api.get<{ content: BackendPlaylistResponse[] }>("/api/v1/playlists?page=0&size=50");
      const content = response.content || [];
      return content.map(mapPlaylistToPlaylist);
    } catch {
      return [];
    }
  }

  async getUserPlaylists(): Promise<Playlist[]> {
    try {
      const response = await api.get<{ content: BackendPlaylistResponse[] }>("/api/v1/playlists/my?page=0&size=50");
      const content = response.content || [];
      return content.map(mapPlaylistToPlaylist);
    } catch {
      return [];
    }
  }

  async getCollections(): Promise<Playlist[]> {
    try {
      const response = await api.get<{ content: BackendPlaylistResponse[] }>("/api/v1/playlists/collections?page=0&size=50");
      const content = response.content || [];
      return content.map(mapPlaylistToPlaylist);
    } catch {
      return [];
    }
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    if (!/^\d+$/.test(id)) {
      return null;
    }
    try {
      const data = await api.get<BackendPlaylistResponse>(`/api/v1/playlists/${id}`);
      return mapPlaylistToPlaylist(data);
    } catch {
      return null;
    }
  }

  async getPlaylistsByTag(tagName: string): Promise<Playlist[]> {
    try {
      const cleanTag = tagName.toLowerCase().trim().replace(/^#/, "");
      const response = await api.get<{ content: BackendPlaylistResponse[] }>(`/api/v1/playlists/tag/${encodeURIComponent(cleanTag)}?page=0&size=50`);
      const content = response.content || [];
      return content.map(mapPlaylistToPlaylist);
    } catch {
      return [];
    }
  }

  async votePlaylist(playlistId: string, rating: number): Promise<Playlist> {
    const data = await api.post<BackendPlaylistResponse>(`/api/v1/playlists/${playlistId}/vote`, { rating });
    return mapPlaylistToPlaylist(data);
  }

  async getGenres(): Promise<Genre[]> {
    try {
      const data = await api.get<Genre[]>("/api/v1/genres");
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // fallback to DEFAULT_GENRES
    }
    return DEFAULT_GENRES;
  }

  async getGenreBySlug(slug: string): Promise<Genre | null> {
    const genres = await this.getGenres();
    const cleanSlug = slug.toLowerCase().replace("-", "_").trim();
    const genre = genres.find((g) =>
      g.slug.toLowerCase() === slug.toLowerCase() ||
      g.slug.toLowerCase() === cleanSlug ||
      g.id.toLowerCase() === slug.toLowerCase()
    );
    return genre || null;
  }

  async getTracksByGenre(genreSlug: string): Promise<Track[]> {
    try {
      const response = await api.get<any>("/api/v1/musics?page=0&size=100");
      const content = response.content || [];
      const tracks = content.map(mapMusicToTrack);
      const cleanGenre = genreSlug.toLowerCase().replace("-", "");
      return tracks.filter((t: Track) =>
        t.artist.genres.some(g => g.toLowerCase().replace(/[-_]/g, "") === cleanGenre) ||
        t.format?.toLowerCase() === genreSlug.toLowerCase()
      );
    } catch {
      return [];
    }
  }

  async getPlaylistsByGenre(genreSlug: string): Promise<Playlist[]> {
    try {
      const playlists = await this.getPlaylists();
      const clean = genreSlug.toLowerCase();
      return playlists.filter((p) => {
        const hasGenreTrack = p.tracks?.some((t) => t.artist.genres.map(g => g.toLowerCase()).includes(clean));
        const titleMatches = p.title.toLowerCase().includes(clean);
        return hasGenreTrack || titleMatches;
      });
    } catch {
      return [];
    }
  }

  async likeTrack(id: string): Promise<Track> {
    const data = await api.post<BackendMusicResponse>(`/api/v1/musics/${id}/like`);
    return mapMusicToTrack(data);
  }

  async dislikeTrack(id: string): Promise<Track> {
    const data = await api.post<BackendMusicResponse>(`/api/v1/musics/${id}/dislike`);
    return mapMusicToTrack(data);
  }

  async getLikedTracks(): Promise<Track[]> {
    try {
      const data = await api.get<BackendMusicResponse[]>("/api/v1/musics/liked");
      return Array.isArray(data) ? data.map(mapMusicToTrack) : [];
    } catch {
      return [];
    }
  }
}

export const musicRepository: MusicRepository = new ApiMusicRepository();
