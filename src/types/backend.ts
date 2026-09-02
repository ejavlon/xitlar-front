export interface BackendImageResponse {
  id: number;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
}

export interface BackendUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

export interface BackendArtistResponse {
  id: number;
  name: string;
  countOfTrack?: number;
  genre?: string;
  voteCount?: number;
  averageRating?: number;
  image?: BackendImageResponse;
  userRating?: number;
}

export interface BackendAlbumResponse {
  id: number;
  title: string;
  artistId?: number;
  artistName?: string;
  image?: BackendImageResponse;
}

export interface BackendLyricsResponse {
  id: number;
  text: string;
  language: string;
  isSynced: boolean;
  lrcContent?: string;
  musicId: number;
  musicTitle: string;
}

export interface BackendMusicResponse {
  id: number;
  title: string;
  audioUrl: string;
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  originalFileName?: string;
  audioSize?: number;
  audioContentType?: string;
  artist?: BackendArtistResponse;
  album?: BackendAlbumResponse;
  genre?: string;
  trackNumber?: number;
  likeCount?: number;
  dislikeCount?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  audioFormat?: string;
  addedDate?: string;
  lyrics?: BackendLyricsResponse;
}

export interface BackendPlaylistMusicResponse {
  id: number;
  title: string;
  audioUrl: string;
  duration: number;
  artist?: BackendArtistResponse;
  album?: BackendAlbumResponse;
  genre?: string;
  position: number;
}

export interface BackendPlaylistResponse {
  id: number;
  title: string;
  tagName?: string;
  description?: string;
  image?: BackendImageResponse;
  musics?: BackendPlaylistMusicResponse[];
  trackCount: number;
  voteCount?: number;
  averageRating?: number;
  userRating?: number;
  createdAt: string;
  createdBy?: BackendUserResponse;
}

export interface BackendPageableResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}
