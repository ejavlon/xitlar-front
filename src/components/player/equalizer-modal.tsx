"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEqualizerStore } from "../../stores/equalizer-store";
import {
  EQUALIZER_BAND_LABELS,
  EQUALIZER_PRESETS
} from "../../types/equalizer";
import { VerticalSlider } from "./vertical-slider";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export function EqualizerModal() {
  const isEnabled = useEqualizerStore((s) => s.isEnabled);
  const selectedPreset = useEqualizerStore((s) => s.selectedPreset);
  const preamp = useEqualizerStore((s) => s.preamp);
  const bands = useEqualizerStore((s) => s.bands);
  const isEqualizerOpen = useEqualizerStore((s) => s.isEqualizerOpen);
  const toggleEnabled = useEqualizerStore((s) => s.toggleEnabled);
  const setPreset = useEqualizerStore((s) => s.setPreset);
  const setBandGain = useEqualizerStore((s) => s.setBandGain);
  const setPreamp = useEqualizerStore((s) => s.setPreamp);
  const setEqualizerOpen = useEqualizerStore((s) => s.setEqualizerOpen);

  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close preset dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setPresetDropdownOpen(false);
      }
    };

    if (presetDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [presetDropdownOpen]);

  if (!isEqualizerOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed bottom-[calc(var(--player-height)+16px)] right-2 sm:right-6 lg:right-10 z-50 w-[340px] sm:w-[460px] bg-[#365377] text-white rounded-xl shadow-2xl border border-[#2c4768] overflow-visible animate-fade-in select-none"
      role="dialog"
      aria-label="10-Band Equalizer"
    >
      {/* 1. TOP HEADER BAR (Matches Screenshot 2) */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-[#2f4a6b] rounded-t-xl">
        {/* Left: Enable/Disable Toggle Button */}
        <button
          type="button"
          onClick={toggleEnabled}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white",
            isEnabled
              ? "bg-white/15 text-white"
              : "bg-black/20 text-white/50 hover:bg-black/30"
          )}
          aria-pressed={isEnabled}
          aria-label={isEnabled ? "Disable Equalizer" : "Enable Equalizer"}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isEnabled ? "bg-emerald-400 shadow-xs shadow-emerald-400/50" : "bg-slate-400"
            )}
          />
          <span>On</span>
        </button>

        {/* Middle: Preset Selector Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            aria-expanded={presetDropdownOpen}
            aria-label="Select equalizer preset"
          >
            <span className="truncate max-w-[140px]">{selectedPreset}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/70" />
          </button>

          {/* Presets Popup Dropdown Menu (Matches Screenshot 2) */}
          {presetDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-44 bg-white text-slate-800 rounded-md shadow-2xl border border-slate-200 py-1 z-50 text-xs animate-fade-in max-h-64 overflow-y-auto">
              {EQUALIZER_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.name;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => {
                      setPreset(preset.name);
                      setPresetDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition-colors",
                      isSelected
                        ? "bg-slate-200/80 font-bold text-slate-900"
                        : "text-slate-700"
                    )}
                  >
                    <span>{preset.name}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#365377] stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Close Button */}
        <button
          type="button"
          onClick={() => setEqualizerOpen(false)}
          className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Close Equalizer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. BODY: 11 VERTICAL SLIDERS (Preamp + 10 Bands) */}
      <div className={cn("p-3 pt-4 transition-opacity", !isEnabled && "opacity-40 pointer-events-none")}>
        <div className="flex items-end justify-between gap-1 sm:gap-1.5 overflow-x-auto pb-1">
          {/* Master Preamp / Gain Slider */}
          <div className="flex flex-col items-center border-r border-white/15 pr-2 mr-1 shrink-0">
            <VerticalSlider
              value={preamp}
              min={-12}
              max={12}
              step={0.5}
              height={110}
              label="Level"
              unit="dB"
              onChange={(val) => setPreamp(val)}
            />
          </div>

          {/* 10 Frequency Band Sliders */}
          <div className="flex items-end justify-between gap-1 sm:gap-1.5 flex-1 min-w-0">
            {EQUALIZER_BAND_LABELS.map((freqLabel, index) => (
              <VerticalSlider
                key={freqLabel}
                value={bands[index] || 0}
                min={-12}
                max={12}
                step={0.5}
                height={110}
                label={freqLabel}
                unit="dB"
                className="flex-1 min-w-[22px] sm:min-w-[26px]"
                onChange={(val) => setBandGain(index, val)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
