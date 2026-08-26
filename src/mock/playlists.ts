import { Playlist } from "../types/playlist";
import { mockTracks } from "./tracks";

// Helpers to get tracks by specific artist or ids
const getTracksByArtist = (artistId: string) => mockTracks.filter((t) => t.artist.id === artistId);
const getTracksByIds = (ids: string[]) => mockTracks.filter((t) => ids.includes(t.id));

export const mockPlaylists: Playlist[] = [
  {
    id: "uzbek-hiphop",
    title: "Uzbek Rap & Conscious Hip-Hop",
    description: "The best of modern Uzbek rap and conscious storytelling, featuring Konsta and regional lyricists.",
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop&q=80",
    trackCount: 4,
    isCollection: false,
    creator: "Javlon",
    tracks: [
      ...getTracksByArtist("konsta"),
      mockTracks.find((t) => t.id === "em-lose-yourself")!
    ].filter(Boolean)
  },
  {
    id: "electronic-hits",
    title: "Electronic & Club Hits",
    description: "Get moving with classic house, french touch, trance, and modern dance anthems.",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop&q=80",
    trackCount: 6,
    isCollection: false,
    creator: "Xitlar Editor",
    tracks: [
      ...getTracksByArtist("daft-punk"),
      ...getTracksByArtist("dj-piligrim")
    ]
  },
  {
    id: "rock-classics",
    title: "Rock Anthems",
    description: "Heavy drums, soaring guitar solos, and timeless alternative rock tracks that never grow old.",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop&q=80",
    trackCount: 5,
    isCollection: true, // A featured collection
    creator: "Xitlar Rock",
    tracks: [
      ...getTracksByArtist("linkin-park"),
      ...getTracksByArtist("coldplay")
    ]
  },
  {
    id: "cinematic-masterpieces",
    title: "Cinematic Soundtracks",
    description: "Grand orchestral works and ambient synthesizer soundtracks to immerse yourself in.",
    coverUrl: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=600&h=600&fit=crop&q=80",
    trackCount: 3,
    isCollection: true,
    creator: "Hans Zimmer Fan",
    tracks: getTracksByArtist("hans-zimmer")
  },
  {
    id: "top-rated",
    title: "Top Rated Playlist",
    description: "The most liked and highly rated songs on Xitlar right now.",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&q=80",
    trackCount: 5,
    isCollection: false,
    creator: "Javlon",
    tracks: getTracksByIds([
      "lp-numb",
      "tw-blinding-lights",
      "em-mockingbird",
      "hz-cornfield-chase",
      "be-lovely"
    ])
  },
  {
    id: "chill-vibe",
    title: "Late Night Chill",
    description: "Smooth R&B and electronic dreamscapes for relaxing or late night drives.",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=600&fit=crop&q=80",
    trackCount: 4,
    isCollection: false,
    creator: "Xitlar Ambient",
    tracks: [
      ...getTracksByArtist("billie-eilish"),
      ...getTracksByArtist("the-weeknd")
    ].slice(0, 4)
  }
];
