"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  discoverNavItems,
  libraryNavItems,
  popularGenres
} from "../../config/navigation";
import { cn } from "../../lib/utils";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  onClose?: () => void; // for mobile drawer close
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none font-sans">
      {/* 1. Discover / Main Navigation */}
      <div className="space-y-1">
        <div className="px-2.5 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Discover
        </div>
        <nav className="flex flex-col space-y-0.5">
          {discoverNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all group",
                  isActive
                    ? "bg-slate-100 text-[#365377] font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#365377] before:rounded-r-full"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {/* Modern rounded-lg icon container */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform ",
                    isActive
                      ? "bg-[#365377] text-white shadow-2xs"
                      : cn(item.badgeBg, item.badgeText, item.badgeBgHover)
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <span className="truncate flex-1">{item.label}</span>

                {/* Optional subtle tag badge (e.g. HOT) */}
                {item.tag && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase bg-amber-100 text-amber-700 rounded">
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. My Music / Library Section */}
      <div className="space-y-1 pt-2 border-t border-slate-100">
        <div className="px-2.5 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          My Library
        </div>
        <nav className="flex flex-col space-y-0.5">
          {libraryNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all group",
                  isActive
                    ? "bg-slate-100 text-[#365377] font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#365377] before:rounded-r-full"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform",
                    isActive
                      ? "bg-[#365377] text-white shadow-2xs"
                      : cn(item.badgeBg, item.badgeText, item.badgeBgHover)
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Popular Genres Section */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between px-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Popular Genres
          </span>
          <Link
            href="/genres"
            onClick={handleLinkClick}
            className="text-[11px] font-semibold text-slate-400 hover:text-[#365377] transition-colors flex items-center gap-0.5 group"
          >
            <span>All</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Clean, modern genre pill cloud */}
        <div className="flex flex-wrap gap-1.5 px-1">
          {popularGenres.map((tag) => {
            const isSelected = Boolean(tag.slug && pathname === `/genres/${tag.slug}`);

            return (
              <Link
                key={tag.slug}
                href={`/genres/${tag.slug}`}
                onClick={handleLinkClick}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-all text-center select-none",
                  isSelected
                    ? "bg-[#365377] text-white border border-[#365377] shadow-2xs font-semibold"
                    : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/50"
                )}
              >
                {tag.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
