import { musicRepository, MusicRepository } from "../repositories/music.repository";
import { Track } from "../types/track";
import { Playlist } from "../types/playlist";
import { Genre } from "../types/genre";

export class MusicService {
  private repository: MusicRepository;

  constructor(repository: MusicRepository = musicRepository) {
    this.repository = repository;
  }

  async getPopularTracks(): Promise<Track[]> {
    return this.repository.getPopularTracks();
  }

  async getTrackById(id: string): Promise<Track | null> {
    return this.repository.getTrackById(id);
  }

  async searchTracks(query: string): Promise<Track[]> {
    return this.repository.searchTracks(query);
  }

  async getPlaylists(): Promise<Playlist[]> {
    return this.repository.getPlaylists();
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    return this.repository.getPlaylistById(id);
  }

  async getPlaylistsByTag(tagName: string): Promise<Playlist[]> {
    return this.repository.getPlaylistsByTag(tagName);
  }

  async votePlaylist(playlistId: string, rating: number): Promise<Playlist> {
    return this.repository.votePlaylist(playlistId, rating);
  }

  async getGenres(): Promise<Genre[]> {
    return this.repository.getGenres();
  }

  async getGenreBySlug(slug: string): Promise<Genre | null> {
    return this.repository.getGenreBySlug(slug);
  }

  async getTracksByGenre(genreSlug: string): Promise<Track[]> {
    return this.repository.getTracksByGenre(genreSlug);
  }

  async getPlaylistsByGenre(genreSlug: string): Promise<Playlist[]> {
    return this.repository.getPlaylistsByGenre(genreSlug);
  }

  async likeTrack(id: string): Promise<Track> {
    return this.repository.likeTrack(id);
  }

  async dislikeTrack(id: string): Promise<Track> {
    return this.repository.dislikeTrack(id);
  }

  async getLikedTracks(): Promise<Track[]> {
    return this.repository.getLikedTracks();
  }
}

export const musicService = new MusicService();
