import { Track } from "../types/track";
import { Playlist } from "../types/playlist";
import { Genre } from "../types/genre";
import { mockTracks } from "../mock/tracks";
import { mockPlaylists } from "../mock/playlists";
import { mockGenres } from "../mock/genres";
import { api, buildMediaUrl, DEFAULT_AVATAR, DEFAULT_PLAYLIST_COVER } from "../lib/api/client";
import { BackendMusicResponse, BackendPlaylistResponse, BackendPlaylistMusicResponse } from "../types/backend";

export interface MusicRepository {
  getPopularTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | null>;
  searchTracks(query: string): Promise<Track[]>;
  getPlaylists(): Promise<Playlist[]>;
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
    coverUrl: music.album && music.album.image ? buildMediaUrl(music.album.image.url) : (music.artist && music.artist.image ? buildMediaUrl(music.artist.image.url) : ""),
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
    isCollection: !playlist.createdBy,
    creator: playlist.createdBy ? `${playlist.createdBy.firstName || ""} ${playlist.createdBy.lastName || ""}`.trim() || playlist.createdBy.username : undefined
  };
}

// Simulated delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockMusicRepository implements MusicRepository {
  async getPopularTracks(): Promise<Track[]> {
    await delay(200);
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

  async getPlaylistsByTag(tagName: string): Promise<Playlist[]> {
    await delay(150);
    const cleanTag = tagName.toLowerCase().trim().replace(/^#/, "");
    return mockPlaylists.filter((p) => {
      const tagMatches = (p.tagName || "playlists").toLowerCase() === cleanTag;
      const titleMatches = p.title.toLowerCase().includes(cleanTag);
      return tagMatches || titleMatches;
    });
  }

  async votePlaylist(playlistId: string, rating: number): Promise<Playlist> {
    await delay(150);
    const playlist = mockPlaylists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.userRating = rating;
      playlist.voteCount = (playlist.voteCount || 0) + 1;
      playlist.averageRating = Math.round((((playlist.averageRating || 4.0) + rating) / 2) * 10) / 10;
    }
    return playlist || mockPlaylists[0];
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
    return mockPlaylists.filter((p) => {
      const hasGenreTrack = p.tracks?.some((t) => t.artist.genres.includes(genreSlug));
      const titleMatches = p.title.toLowerCase().includes(genreSlug.toLowerCase());
      return hasGenreTrack || titleMatches;
    });
  }

  async likeTrack(id: string): Promise<Track> {
    await delay(100);
    const track = mockTracks.find((t) => t.id === id);
    if (track) {
      track.isLiked = !track.isLiked;
      if (track.isLiked) {
        track.likesCount++;
        if (track.isDisliked) {
          track.isDisliked = false;
          track.dislikesCount = Math.max(0, track.dislikesCount - 1);
        }
      } else {
        track.likesCount = Math.max(0, track.likesCount - 1);
      }
    }
    return track || mockTracks[0];
  }

  async dislikeTrack(id: string): Promise<Track> {
    await delay(100);
    const track = mockTracks.find((t) => t.id === id);
    if (track) {
      track.isDisliked = !track.isDisliked;
      if (track.isDisliked) {
        track.dislikesCount++;
        if (track.isLiked) {
          track.isLiked = false;
          track.likesCount = Math.max(0, track.likesCount - 1);
        }
      } else {
        track.dislikesCount = Math.max(0, track.dislikesCount - 1);
      }
    }
    return track || mockTracks[0];
  }

  async getLikedTracks(): Promise<Track[]> {
    await delay(100);
    return mockTracks.filter((t) => t.isLiked);
  }
}

export class ApiMusicRepository implements MusicRepository {
  async getPopularTracks(): Promise<Track[]> {
    const response = await api.get<{ content: BackendMusicResponse[] }>("/api/v1/musics?page=0&size=50&sortBy=likeCount&sortDirection=desc");
    const content = response.content || [];
    return content.map(mapMusicToTrack);
  }

  async getTrackById(id: string): Promise<Track | null> {
    if (!/^\d+$/.test(id)) {
      return null;
    }
    const data = await api.get<BackendMusicResponse>(`/api/v1/musics/${id}`);
    return mapMusicToTrack(data);
  }

  async searchTracks(query: string): Promise<Track[]> {
    const q = query.toLowerCase().trim();
    const response = await api.get<{ content: BackendMusicResponse[] }>("/api/v1/musics?page=0&size=100");
    const content = response.content || [];
    const tracks = content.map(mapMusicToTrack);
    if (!q) return tracks;
    return tracks.filter(
      (t: Track) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.name.toLowerCase().includes(q) ||
        (t.album && t.album.title.toLowerCase().includes(q))
    );
  }

  async getPlaylists(): Promise<Playlist[]> {
    const response = await api.get<{ content: BackendPlaylistResponse[] }>("/api/v1/playlists?page=0&size=50");
    const content = response.content || [];
    return content.map(mapPlaylistToPlaylist);
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    if (!/^\d+$/.test(id)) {
      return null;
    }
    const data = await api.get<BackendPlaylistResponse>(`/api/v1/playlists/${id}`);
    return mapPlaylistToPlaylist(data);
  }

  async getPlaylistsByTag(tagName: string): Promise<Playlist[]> {
    const cleanTag = tagName.toLowerCase().trim().replace(/^#/, "");
    try {
      const response = await api.get<{ content: BackendPlaylistResponse[] }>(`/api/v1/playlists/tag/${encodeURIComponent(cleanTag)}?page=0&size=50`);
      const content = response.content || [];
      return content.map(mapPlaylistToPlaylist);
    } catch (e) {
      const allPlaylists = await this.getPlaylists();
      return allPlaylists.filter((p) => (p.tagName || "playlists").toLowerCase() === cleanTag);
    }
  }

  async votePlaylist(playlistId: string, rating: number): Promise<Playlist> {
    const data = await api.post<BackendPlaylistResponse>(`/api/v1/playlists/${playlistId}/vote`, { rating });
    return mapPlaylistToPlaylist(data);
  }

  async getGenres(): Promise<Genre[]> {
    return mockGenres;
  }

  async getGenreBySlug(slug: string): Promise<Genre | null> {
    const genre = mockGenres.find((g) => g.slug === slug);
    return genre || null;
  }

  async getTracksByGenre(genreSlug: string): Promise<Track[]> {
    const response = await api.get<any>("/api/v1/musics?page=0&size=100");
    const content = response.content || [];
    const tracks = content.map(mapMusicToTrack);
    return tracks.filter((t: Track) =>
      t.artist.genres.map(g => g.toLowerCase()).includes(genreSlug.toLowerCase()) ||
      t.format?.toLowerCase() === genreSlug.toLowerCase()
    );
  }

  async getPlaylistsByGenre(genreSlug: string): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    return playlists.filter((p) => {
      const hasGenreTrack = p.tracks?.some((t) => t.artist.genres.map(g => g.toLowerCase()).includes(genreSlug.toLowerCase()));
      const titleMatches = p.title.toLowerCase().includes(genreSlug.toLowerCase());
      return hasGenreTrack || titleMatches;
    });
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
    const data = await api.get<BackendMusicResponse[]>("/api/v1/musics/liked");
    return data.map(mapMusicToTrack);
  }
}

export const musicRepository: MusicRepository = new ApiMusicRepository();
