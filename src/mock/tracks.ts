import { Track } from "../types/track";
import { mockArtists } from "./artists";

// Helper to find artist by id
const getArtist = (id: string) => {
  const artist = mockArtists.find((a) => a.id === id);
  if (!artist) {
    throw new Error(`Mock artist with ID "${id}" not found. Verify artists.ts matches.`);
  }
  return artist;
};

export const mockTracks: Track[] = [
  // Eminem
  {
    id: "em-lose-yourself",
    title: "Lose Yourself",
    artist: getArtist("eminem"),
    album: {
      id: "8-mile-ost",
      title: "8 Mile (Music from and Inspired by the Motion Picture)",
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop&q=80",
      releaseDate: "2002-10-28"
    },
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 326,
    releaseDate: "2002-10-28",
    likesCount: 1254320,
    dislikesCount: 14200,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "em-without-me",
    title: "Without Me",
    artist: getArtist("eminem"),
    album: {
      id: "the-eminem-show",
      title: "The Eminem Show",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop&q=80",
      releaseDate: "2002-05-26"
    },
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 290,
    releaseDate: "2002-05-26",
    likesCount: 954000,
    dislikesCount: 8100,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "em-mockingbird",
    title: "Mockingbird",
    artist: getArtist("eminem"),
    album: {
      id: "encore",
      title: "Encore",
      coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=500&fit=crop&q=80",
      releaseDate: "2004-11-12"
    },
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 251,
    releaseDate: "2004-11-12",
    likesCount: 1450000,
    dislikesCount: 9500,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Konsta
  {
    id: "ko-hamma-shunda",
    title: "Hamma Shunda",
    artist: getArtist("konsta"),
    album: {
      id: "ko-singillar",
      title: "Singillar",
      coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop&q=80",
      releaseDate: "2023-04-15"
    },
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 210,
    releaseDate: "2023-04-15",
    likesCount: 85200,
    dislikesCount: 420,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "ko-inson",
    title: "Inson",
    artist: getArtist("konsta"),
    coverUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 245,
    releaseDate: "2022-11-20",
    likesCount: 125000,
    dislikesCount: 650,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "ko-poyga",
    title: "Poyga",
    artist: getArtist("konsta"),
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 185,
    releaseDate: "2023-09-01",
    likesCount: 94000,
    dislikesCount: 380,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Billie Eilish
  {
    id: "be-bad-guy",
    title: "Bad Guy",
    artist: getArtist("billie-eilish"),
    album: {
      id: "be-album-1",
      title: "When We All Fall Asleep, Where Do We Go?",
      coverUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop&q=80",
      releaseDate: "2019-03-29"
    },
    coverUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: 194,
    releaseDate: "2019-03-29",
    likesCount: 2200000,
    dislikesCount: 35000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "be-everything-i-wanted",
    title: "Everything I Wanted",
    artist: getArtist("billie-eilish"),
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 245,
    releaseDate: "2019-11-13",
    likesCount: 1400000,
    dislikesCount: 11000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Linkin Park
  {
    id: "lp-in-the-end",
    title: "In the End",
    artist: getArtist("linkin-park"),
    album: {
      id: "lp-hybrid-theory",
      title: "Hybrid Theory",
      coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop&q=80",
      releaseDate: "2000-10-24"
    },
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    duration: 216,
    releaseDate: "2000-10-24",
    likesCount: 3100000,
    dislikesCount: 19000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "lp-numb",
    title: "Numb",
    artist: getArtist("linkin-park"),
    album: {
      id: "lp-meteora",
      title: "Meteora",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop&q=80",
      releaseDate: "2003-03-25"
    },
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    duration: 187,
    releaseDate: "2003-03-25",
    likesCount: 4500000,
    dislikesCount: 22000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Daft Punk
  {
    id: "dp-get-lucky",
    title: "Get Lucky",
    artist: getArtist("daft-punk"),
    album: {
      id: "dp-ram",
      title: "Random Access Memories",
      coverUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&h=500&fit=crop&q=80",
      releaseDate: "2013-05-17"
    },
    coverUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    duration: 249,
    releaseDate: "2013-04-19",
    likesCount: 1800000,
    dislikesCount: 16000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "dp-one-more-time",
    title: "One More Time",
    artist: getArtist("daft-punk"),
    album: {
      id: "dp-discovery",
      title: "Discovery",
      coverUrl: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&h=500&fit=crop&q=80",
      releaseDate: "2000-11-13"
    },
    coverUrl: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: 320,
    releaseDate: "2000-11-13",
    likesCount: 820000,
    dislikesCount: 6500,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // The Weeknd
  {
    id: "tw-blinding-lights",
    title: "Blinding Lights",
    artist: getArtist("the-weeknd"),
    album: {
      id: "tw-after-hours",
      title: "After Hours",
      coverUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&q=80",
      releaseDate: "2020-03-20"
    },
    coverUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    duration: 200,
    releaseDate: "2019-11-29",
    likesCount: 5200000,
    dislikesCount: 41000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "tw-starboy",
    title: "Starboy",
    artist: getArtist("the-weeknd"),
    album: {
      id: "tw-starboy-album",
      title: "Starboy",
      coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&h=500&fit=crop&q=80",
      releaseDate: "2016-11-25"
    },
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    duration: 230,
    releaseDate: "2016-09-21",
    likesCount: 3800000,
    dislikesCount: 31000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Rayhon
  {
    id: "ra-yomgir",
    title: "Yomg'ir",
    artist: getArtist("rayhon"),
    coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    duration: 222,
    releaseDate: "2006-10-10",
    likesCount: 42000,
    dislikesCount: 890,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "ra-seni-deb",
    title: "Seni Deb",
    artist: getArtist("rayhon"),
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    duration: 215,
    releaseDate: "2011-05-15",
    likesCount: 65000,
    dislikesCount: 1100,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Coldplay
  {
    id: "cp-viva-la-vida",
    title: "Viva La Vida",
    artist: getArtist("coldplay"),
    album: {
      id: "cp-viva-album",
      title: "Viva la Vida or Death and All His Friends",
      coverUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=500&fit=crop&q=80",
      releaseDate: "2008-06-12"
    },
    coverUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 242,
    releaseDate: "2008-05-25",
    likesCount: 2900000,
    dislikesCount: 15000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "cp-yellow",
    title: "Yellow",
    artist: getArtist("coldplay"),
    album: {
      id: "cp-parachutes",
      title: "Parachutes",
      coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop&q=80",
      releaseDate: "2000-07-10"
    },
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 269,
    releaseDate: "2000-06-26",
    likesCount: 3400000,
    dislikesCount: 18000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // DJ Piligrim
  {
    id: "dp-ola",
    title: "Da Mne (Ola)",
    artist: getArtist("dj-piligrim"),
    coverUrl: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 232,
    releaseDate: "2008-04-12",
    likesCount: 78000,
    dislikesCount: 1200,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "dp-leila",
    title: "Leila",
    artist: getArtist("dj-piligrim"),
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 285,
    releaseDate: "2010-09-18",
    likesCount: 92000,
    dislikesCount: 1300,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Hans Zimmer
  {
    id: "hz-time",
    title: "Time",
    artist: getArtist("hans-zimmer"),
    album: {
      id: "hz-inception-ost",
      title: "Inception (Music from the Motion Picture)",
      coverUrl: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=500&h=500&fit=crop&q=80",
      releaseDate: "2010-07-13"
    },
    coverUrl: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 275,
    releaseDate: "2010-07-13",
    likesCount: 1850000,
    dislikesCount: 5200,
    bitrate: 1411,
    sampleRate: 44100,
    format: "wav"
  },
  {
    id: "hz-cornfield-chase",
    title: "Cornfield Chase",
    artist: getArtist("hans-zimmer"),
    album: {
      id: "hz-interstellar-ost",
      title: "Interstellar (Original Motion Picture Soundtrack)",
      coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&h=500&fit=crop&q=80",
      releaseDate: "2014-11-17"
    },
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 126,
    releaseDate: "2014-11-17",
    likesCount: 2200000,
    dislikesCount: 6100,
    bitrate: 1411,
    sampleRate: 44100,
    format: "flac"
  },

  // Additional 8 tracks to reach 30+ to satisfy mock data richness
  {
    id: "em-mockingbird-remix",
    title: "Mockingbird (Lofi Remix)",
    artist: getArtist("eminem"),
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: 180,
    releaseDate: "2021-04-12",
    likesCount: 145000,
    dislikesCount: 1800,
    bitrate: 192,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "ko-singillar",
    title: "Singillar",
    artist: getArtist("konsta"),
    album: {
      id: "ko-singillar",
      title: "Singillar",
      coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop&q=80",
      releaseDate: "2023-04-15"
    },
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 250,
    releaseDate: "2023-04-15",
    likesCount: 112000,
    dislikesCount: 560,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "be-lovely",
    title: "Lovely",
    artist: getArtist("billie-eilish"),
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    duration: 200,
    releaseDate: "2018-04-19",
    likesCount: 4500000,
    dislikesCount: 23000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "lp-faint",
    title: "Faint",
    artist: getArtist("linkin-park"),
    album: {
      id: "lp-meteora",
      title: "Meteora",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop&q=80",
      releaseDate: "2003-03-25"
    },
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    duration: 162,
    releaseDate: "2003-03-25",
    likesCount: 1900000,
    dislikesCount: 11000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "dp-around-the-world",
    title: "Around the World",
    artist: getArtist("daft-punk"),
    album: {
      id: "dp-homework",
      title: "Homework",
      coverUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&h=500&fit=crop&q=80",
      releaseDate: "1997-01-20"
    },
    coverUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    duration: 429,
    releaseDate: "1997-03-17",
    likesCount: 710000,
    dislikesCount: 9000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "tw-save-your-tears",
    title: "Save Your Tears",
    artist: getArtist("the-weeknd"),
    album: {
      id: "tw-after-hours",
      title: "After Hours",
      coverUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&q=80",
      releaseDate: "2020-03-20"
    },
    coverUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: 215,
    releaseDate: "2020-08-09",
    likesCount: 4200000,
    dislikesCount: 29000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "cp-fix-you",
    title: "Fix You",
    artist: getArtist("coldplay"),
    album: {
      id: "cp-x-y",
      title: "X&Y",
      coverUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=500&fit=crop&q=80",
      releaseDate: "2005-06-06"
    },
    coverUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    duration: 295,
    releaseDate: "2005-09-05",
    likesCount: 2700000,
    dislikesCount: 12000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "hz-interstellar-theme",
    title: "Interstellar Main Theme (Live)",
    artist: getArtist("hans-zimmer"),
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    duration: 380,
    releaseDate: "2017-02-15",
    likesCount: 950000,
    dislikesCount: 2500,
    bitrate: 1411,
    sampleRate: 48000,
    format: "flac"
  },

  // Dua Lipa
  {
    id: "dl-levitating",
    title: "Levitating",
    artist: getArtist("dua-lipa"),
    album: {
      id: "dl-future-nostalgia",
      title: "Future Nostalgia",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop&q=80",
      releaseDate: "2020-03-27"
    },
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    duration: 203,
    releaseDate: "2020-10-01",
    likesCount: 2400000,
    dislikesCount: 18000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "dl-dont-start-now",
    title: "Don't Start Now",
    artist: getArtist("dua-lipa"),
    album: {
      id: "dl-future-nostalgia",
      title: "Future Nostalgia",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop&q=80",
      releaseDate: "2020-03-27"
    },
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    duration: 183,
    releaseDate: "2019-10-31",
    likesCount: 3100000,
    dislikesCount: 22000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },

  // Imagine Dragons
  {
    id: "id-believer",
    title: "Believer",
    artist: getArtist("imagine-dragons"),
    album: {
      id: "id-evolve",
      title: "Evolve",
      coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop&q=80",
      releaseDate: "2017-06-23"
    },
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 204,
    releaseDate: "2017-02-01",
    likesCount: 5200000,
    dislikesCount: 35000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  },
  {
    id: "id-radioactive",
    title: "Radioactive",
    artist: getArtist("imagine-dragons"),
    album: {
      id: "id-night-visions",
      title: "Night Visions",
      coverUrl: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=500&h=500&fit=crop&q=80",
      releaseDate: "2012-09-04"
    },
    coverUrl: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=500&h=500&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 187,
    releaseDate: "2012-10-29",
    likesCount: 4100000,
    dislikesCount: 29000,
    bitrate: 320,
    sampleRate: 44100,
    format: "mp3"
  }
];
