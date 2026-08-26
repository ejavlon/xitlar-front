export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  coverUrl?: string;
  trackCount: number;
  genres: string[];
  rating?: number;
  bio?: string;
}
