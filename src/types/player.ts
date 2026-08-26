import { Track } from "./track";

export type RepeatMode = "off" | "one" | "all";
export type AudioQuality = "MQ" | "HQ";

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;

  isPlaying: boolean;

  currentTime: number;
  duration: number;

  volume: number;
  isMuted: boolean;

  repeatMode: RepeatMode;
  isShuffled: boolean;

  quality: AudioQuality;
}
