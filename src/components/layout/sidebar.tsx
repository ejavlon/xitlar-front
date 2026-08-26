"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sefonNavItems, sefonGenreTags } from "../../config/navigation";
import { cn } from "../../lib/utils";

interface SidebarProps {
  onClose?: () => void; // for mobile drawer close
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* 1. Discover / Categories Section */}
      <nav className="flex flex-col space-y-0.5">
        {sefonNavItems.map((item) => {
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
                "flex items-center gap-3 px-2 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors group",
                isActive
                  ? "bg-slate-100 text-[#365377] font-semibold"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {/* Colorful round circle badge */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105",
                  item.color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 2. Music by Genres Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
          Music by Genres
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {sefonGenreTags.map((tag) => {
            const isSelected = Boolean(tag.slug && pathname === `/genres/${tag.slug}`);
            const isMore = tag.label === "more...";

            return (
              <Link
                key={tag.label}
                href={tag.slug ? `/genres/${tag.slug}` : "/genres"}
                onClick={handleLinkClick}
                className={cn(
                  "h-7 sm:h-[30px] px-1.5 flex items-center justify-center rounded-[8px] border text-[12px] font-medium transition-all text-center select-none truncate",
                  isSelected
                    ? "bg-[#365377] text-white border-[#365377] shadow-xs"
                    : "bg-[#e9eef5] hover:bg-[#dde5ef] text-[#334155] border-[#d9e2ec] hover:border-[#cbd5e1] hover:text-slate-900"
                )}
              >
                {isMore ? "more..." : `# ${tag.label}`}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

