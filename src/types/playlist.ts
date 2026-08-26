import { Track } from "./track";

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  trackCount: number;
  tracks?: Track[];
  isCollection?: boolean; // collections or playlists
  creator?: string;
}
