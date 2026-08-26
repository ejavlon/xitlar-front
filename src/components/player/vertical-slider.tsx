"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "../../lib/utils";

interface VerticalSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  subLabel?: string;
  unit?: string;
  height?: number; // in pixels
  className?: string;
  showTooltip?: boolean;
}

export function VerticalSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  subLabel,
  unit = "dB",
  height = 110,
  className,
  showTooltip = true
}: VerticalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize percentage from bottom (0% = min, 100% = max)
  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const calculateValueFromPointer = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickY = clientY - rect.top;
      // Invert Y because bottom is min (0%), top is max (100%)
      const ratio = 1 - Math.max(0, Math.min(1, clickY / rect.height));
      const rawVal = min + ratio * (max - min);

      // Snap to step
      const steppedVal = Math.round((rawVal - min) / step) * step + min;
      const finalVal = Math.max(min, Math.min(max, Number(steppedVal.toFixed(2))));
      onChange(finalVal);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateValueFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    calculateValueFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextVal = Math.min(max, clampedValue + step);
      onChange(Number(nextVal.toFixed(2)));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      const nextVal = Math.max(min, clampedValue - step);
      onChange(Number(nextVal.toFixed(2)));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      className={cn("flex flex-col items-center select-none group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Interactive Track Box */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-label={label || "Slider"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={{ height: `${height}px` }}
        className="relative w-7 sm:w-8 flex items-center justify-center cursor-pointer touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
      >
        {/* Value Tooltip floating above thumb */}
        {showTooltip && (isHovered || isDragging) && (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-30 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold shadow-md whitespace-nowrap transition-opacity"
            style={{
              bottom: `calc(${percentage}% + 8px)`
            }}
          >
            {clampedValue > 0 ? `+${clampedValue}` : clampedValue} {unit}
          </div>
        )}

        {/* Center Zero reference subtle line */}
        {min < 0 && max > 0 && (
          <div className="absolute top-1/2 left-1 right-1 h-[1px] bg-slate-400/30 pointer-events-none" />
        )}

        {/* Background Vertical Rail */}
        <div className="w-[3px] sm:w-[4px] h-full bg-[#4e6b8c] rounded-full overflow-hidden relative">
          {/* Active fill up to thumb */}
          <div
            className="w-full bg-amber-400/80 absolute bottom-0 rounded-full transition-all duration-75"
            style={{ height: `${percentage}%` }}
          />
        </div>

        {/* Yellow Slider Thumb (Matches Sefon screenshots) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 sm:w-4.5 h-1.5 sm:h-2 bg-[#fbbf24] hover:bg-[#f59e0b] active:bg-[#d97706] rounded-[2px] shadow-sm pointer-events-none transition-transform duration-75 group-hover:scale-110"
          style={{
            bottom: `calc(${percentage}% - 4px)`
          }}
        />
      </div>

      {/* Label underneath */}
      {label && (
        <div className="mt-1 text-center">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 group-hover:text-white leading-tight block">
            {label}
          </span>
          {subLabel && (
            <span className="text-[8px] text-slate-400 block -mt-0.5">
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
