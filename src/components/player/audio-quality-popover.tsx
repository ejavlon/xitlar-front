"use client";

import React, { useState, useRef, useEffect } from "react";
import { AudioQuality } from "../../types/player";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface AudioQualityPopoverProps {
  quality: AudioQuality;
  setQuality: (quality: AudioQuality) => void;
  disabled?: boolean;
  className?: string;
}

export function AudioQualityPopover({
  quality,
  setQuality,
  disabled = false,
  className
}: AudioQualityPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoudMode, setIsLoudMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectQuality = (newQuality: AudioQuality) => {
    setQuality(newQuality);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center", className)}>
      {!disabled && isOpen && (
        <div
          className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[175px] py-2.5 px-3 bg-[#456690] text-white rounded-lg shadow-2xl border border-[#38557a] z-50 select-none text-left"
          role="dialog"
          aria-label="Audio quality selection"
        >
          <div className="text-[10.5px] font-bold tracking-wider text-white/90 uppercase pb-1.5 mb-1 border-b border-white/15">
            SOUND QUALITY
          </div>

          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleSelectQuality("HQ")}
              className={cn(
                "w-full flex items-center justify-between py-1.5 px-1.5 rounded text-xs font-semibold transition-colors text-left",
                quality === "HQ"
                  ? "text-amber-300 font-bold"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <span>HQ High</span>
              {quality === "HQ" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 fill-amber-300/20 stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectQuality("MQ")}
              className={cn(
                "w-full flex items-center justify-between py-1.5 px-1.5 rounded text-xs font-semibold transition-colors text-left",
                quality === "MQ"
                  ? "text-amber-300 font-bold"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <span>MQ Medium</span>
              {quality === "MQ" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 fill-amber-300/20 stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsLoudMode(!isLoudMode)}
              className={cn(
                "w-full flex items-center justify-between py-1.5 px-1.5 rounded text-xs font-semibold transition-colors text-left",
                isLoudMode
                  ? "text-amber-300 font-bold"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <span>LOUD Mode</span>
              {isLoudMode && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 fill-amber-300/20 stroke-[2.5]" />
              )}
            </button>
          </div>

          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#456690]" />
        </div>
      )}

      <button
        onClick={!disabled ? () => setIsOpen(!isOpen) : undefined}
        disabled={disabled}
        className={cn(
          "w-7 h-6 flex items-center justify-center text-xs font-bold uppercase transition-colors focus:outline-none rounded",
          disabled
            ? "text-slate-300 pointer-events-none cursor-not-allowed"
            : isOpen
            ? "text-[#456690] bg-slate-100"
            : "text-slate-700 hover:text-slate-900 cursor-pointer"
        )}
        aria-label={`Select audio quality. Current: ${quality}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {quality}
      </button>
    </div>
  );
}
