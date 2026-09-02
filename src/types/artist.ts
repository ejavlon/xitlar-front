export interface Artist {
  id: string;
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  trackCount?: number;
  genres: string[];
  rating?: number;
  votesCount?: number;
  userRating?: number;
  bio?: string;
  listenersCount?: number;
}
