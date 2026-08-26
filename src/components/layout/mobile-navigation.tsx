"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, User, Menu } from "lucide-react";
import { cn } from "../../lib/utils";

interface MobileNavigationProps {
  onMenuToggle: () => void;
}

export function MobileNavigation({ onMenuToggle }: MobileNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Library", href: "/collections", icon: Library },
    { label: "Artists", href: "/artists", icon: User }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-md">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 text-[11px] font-medium transition-colors",
              isActive ? "text-[#365377] font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Icon className="w-4.5 h-4.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Slide-out Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 focus:outline-none"
        aria-label="Open Sidebar Menu"
      >
        <Menu className="w-4.5 h-4.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
}

