"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePlayerStore } from "../../stores/player-store";
import { useEqualizerStore } from "../../stores/equalizer-store";
import { VerticalSlider } from "./vertical-slider";
import { Volume2, Volume1, VolumeX, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

interface VolumePopoverProps {
  className?: string;
  disabled?: boolean;
}

export function VolumePopover({ className, disabled = false }: VolumePopoverProps) {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const toggleEqualizer = useEqualizerStore((s) => s.toggleEqualizer);
  const isEqualizerOpen = useEqualizerStore((s) => s.isEqualizerOpen);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  const effectiveVolume = isMuted ? 0 : volume;

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (isMuted && newVal > 0) {
      toggleMute();
    }
  };

  const getVolumeIcon = () => {
    if (disabled) {
      return <Volume2 className="w-4.5 h-4.5 text-slate-300" />;
    }
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4.5 h-4.5 text-slate-400" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-4.5 h-4.5 text-slate-600" />;
    }
    return <Volume2 className="w-4.5 h-4.5 text-slate-600" />;
  };

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center", className)}>
      {/* 1. VERTICAL POPUP (Matches Screenshot 1) */}
      {!disabled && isOpen && (
        <div
          className="absolute bottom-[calc(100%+12px)] right-1/2 translate-x-1/2 w-11 py-2.5 px-1 bg-[#365377] rounded-md shadow-2xl border border-[#2b4463] flex flex-col items-center gap-2 z-50 animate-fade-in select-none"
          role="dialog"
          aria-label="Volume and Equalizer controls"
        >
          {/* Top: Equalizer Button Icon */}
          <button
            type="button"
            onClick={() => {
              toggleEqualizer();
            }}
            className={cn(
              "p-1.5 rounded transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-white",
              isEqualizerOpen
                ? "bg-amber-400 text-slate-900 shadow-xs"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
            title="Equalizer"
            aria-label="Toggle Equalizer Panel"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Divider line */}
          <div className="w-6 h-[1px] bg-white/10" />

          {/* Vertical Volume Slider */}
          <VerticalSlider
            value={effectiveVolume}
            min={0}
            max={1}
            step={0.01}
            height={100}
            unit="%"
            showTooltip={true}
            onChange={handleVolumeChange}
          />

          {/* Downward triangle pointer arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#365377]" />
        </div>
      )}

      {/* 2. SPEAKER BUTTON IN PLAYER BAR */}
      <button
        type="button"
        onClick={!disabled ? () => setIsOpen(!isOpen) : undefined}
        disabled={disabled}
        className={cn(
          "p-1.5 rounded transition-colors focus:outline-none",
          disabled
            ? "cursor-not-allowed text-slate-300 opacity-60 pointer-events-none"
            : isOpen
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
        aria-label={isMuted ? "Unmute and open volume popup" : "Open volume popup"}
        aria-expanded={isOpen}
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
}
