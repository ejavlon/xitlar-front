export interface MusicVideo {
  id: string;
  title: string;
  artistName: string;
  artistId?: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  releaseDate: string;
  category: "international" | "uzbek" | "russian" | "kazakh";
  views?: number;
}
