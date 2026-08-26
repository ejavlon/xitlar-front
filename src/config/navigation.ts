import {
  Play,
  Music,
  Headphones,
  Mic2,
  Video,
  Phone,
  Volume2,
  CassetteTape,
  Smile,
  Baby,
  Sun,
  Heart,
  Zap,
  Award,
  SlidersHorizontal,
  LucideIcon
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string; // Background color class for circle badge
}

export const sefonNavItems: NavItem[] = [
  { label: "New Releases", href: "/", icon: Play, color: "bg-[#5fc3f3] text-white" },
  { label: "Collections", href: "/collections", icon: Music, color: "bg-[#ff6d8c] text-white" },
  { label: "Genres", href: "/genres", icon: Headphones, color: "bg-[#fec33d] text-white" },
  { label: "Artists", href: "/artists", icon: Mic2, color: "bg-[#ff9e42] text-white" },
  { label: "Music Videos", href: "#videos", icon: Video, color: "bg-[#92cc77] text-white" },
  { label: "Ringtones", href: "#ringtones", icon: Phone, color: "bg-[#82afc4] text-white" },
  { label: "Popular", href: "/#popular", icon: Volume2, color: "bg-[#6bc0bf] text-white" },
  { label: "Retro", href: "/genres/retro", icon: CassetteTape, color: "bg-[#ff7e7d] text-white" },
  { label: "Moods", href: "/playlists/chill-vibe", icon: Smile, color: "bg-[#60a5fa] text-white" },
  { label: "Kids", href: "/genres/pop", icon: Baby, color: "bg-[#6fcf97] text-white" },
  { label: "Summer", href: "/playlists/top-rated", icon: Sun, color: "bg-[#7ecefd] text-white" },
  { label: "Vibe", href: "/playlists/chill-vibe", icon: Heart, color: "bg-[#ff8e75] text-white" },
  { label: "Chill", href: "/playlists/chill-vibe", icon: Zap, color: "bg-[#9b8df4] text-white" },
  { label: "Top Rated", href: "/playlists/top-rated", icon: Award, color: "bg-[#88b3be] text-white" },
  { label: "Custom Selection", href: "/collections", icon: SlidersHorizontal, color: "bg-[#db9f89] text-white" },
];

export const sefonGenreTags = [
  { label: "pop", slug: "pop" },
  { label: "club", slug: "club" },
  { label: "chanson", slug: "chanson" },
  { label: "rap", slug: "rap" },
  { label: "rock", slug: "rock" },
  { label: "trance", slug: "trance" },
  { label: "dance", slug: "dance" },
  { label: "relax", slug: "relax" },
  { label: "dubstep", slug: "dubstep" },
  { label: "house", slug: "house" },
  { label: "metal", slug: "metal" },
  { label: "more...", slug: "" },
];

