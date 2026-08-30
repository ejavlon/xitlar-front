import { Artist } from "./artist";

export type AudioFormat = "mp3" | "flac" | "wav" | "aac";

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  releaseDate: string;
}

export interface TrackLyrics {
  id: number;
  text: string;
  language: string;
  isSynced: boolean;
  lrcContent?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: Artist;
  album?: Album;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  releaseDate: string;
  likesCount: number;
  dislikesCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  bitrate?: number;
  sampleRate?: number;
  format?: AudioFormat;
  lyrics?: TrackLyrics;
}
