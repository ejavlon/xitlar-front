import {
  Home,
  Flame,
  Disc3,
  Library,
  Headphones,
  Mic2,
  Heart,
  ListMusic,
  LucideIcon
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeText: string;
  badgeTextHover?: string;
  badgeBgHover?: string;
  tag?: string;
  requiresAuth?: boolean;
}

export interface GenreTag {
  label: string;
  slug: string;
}

// 1. Primary discovery navigation
export const discoverNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
    badgeBgHover: "group-hover:bg-slate-200",
  },
  {
    label: "Trending Hits",
    href: "/trending",
    icon: Flame,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-500",
    badgeBgHover: "group-hover:bg-amber-100",
    tag: "HOT",
  },
  {
    label: "New",
    href: "/new",
    icon: Disc3,
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-600",
    badgeBgHover: "group-hover:bg-purple-100",
  },
  {
    label: "Collections",
    href: "/collections",
    icon: Library,
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-500",
    badgeBgHover: "group-hover:bg-rose-100",
  },
  {
    label: "Genres",
    href: "/genres",
    icon: Headphones,
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-600",
    badgeBgHover: "group-hover:bg-teal-100",
  },
  {
    label: "Artists",
    href: "/artists",
    icon: Mic2,
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-600",
    badgeBgHover: "group-hover:bg-sky-100",
  },
];

// 2. Personal library navigation
export const libraryNavItems: NavItem[] = [
  {
    label: "Favorites",
    href: "/profile?tab=likes",
    icon: Heart,
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-500",
    badgeBgHover: "group-hover:bg-rose-100",
    requiresAuth: true,
  },
  {
    label: "My Playlists",
    href: "/profile?tab=playlists",
    icon: ListMusic,
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-600",
    badgeBgHover: "group-hover:bg-indigo-100",
    requiresAuth: true,
  },
];

// 3. Clean, popular genre tags
export const popularGenres: GenreTag[] = [
  { label: "Pop", slug: "pop" },
  { label: "Rap", slug: "rap" },
  { label: "Rock", slug: "rock" },
  { label: "Dance", slug: "dance" },
  { label: "Club", slug: "club" },
  { label: "House", slug: "house" },
  { label: "Chanson", slug: "chanson" },
  { label: "Trance", slug: "trance" },
  { label: "Phonk", slug: "phonk" },
  { label: "Chill", slug: "relax" },
];

export const mainNavItems = discoverNavItems;
export const genreTags = popularGenres;
