import { artistRepository, ArtistRepository } from "../repositories/artist.repository";
import { Artist } from "../types/artist";
import { Track } from "../types/track";

export type ArtistTrackSortMode = "popular" | "alphabetical" | "date";

export class ArtistService {
  private repository: ArtistRepository;

  constructor(repository: ArtistRepository = artistRepository) {
    this.repository = repository;
  }

  async getArtists(): Promise<Artist[]> {
    return this.repository.getArtists();
  }

  async getArtistById(id: string): Promise<Artist | null> {
    return this.repository.getArtistById(id);
  }

  async getTracksByArtist(
    artistId: string,
    sortMode: ArtistTrackSortMode = "popular"
  ): Promise<Track[]> {
    const tracks = await this.repository.getTracksByArtist(artistId);

    switch (sortMode) {
      case "alphabetical":
        return [...tracks].sort((a, b) => a.title.localeCompare(b.title));
      case "date":
        return [...tracks].sort(
          (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      case "popular":
      default:
        return [...tracks].sort((a, b) => b.likesCount - a.likesCount);
    }
  }

  async searchArtists(query: string): Promise<Artist[]> {
    return this.repository.searchArtists(query);
  }
}

export const artistService = new ArtistService();
