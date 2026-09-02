import { Track } from "./track";

export interface Playlist {
  id: string;
  title: string;
  tagName?: string;
  description?: string;
  coverUrl?: string;
  trackCount: number;
  voteCount?: number;
  averageRating?: number;
  userRating?: number;
  createdAt?: string;
  tracks?: Track[];
  isCollection?: boolean; // collections or playlists
  creator?: string;
}
