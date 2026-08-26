import { create } from "zustand";
import {
  CUSTOM_PRESET_NAME,
  EQUALIZER_PRESETS,
  EqualizerState
} from "../types/equalizer";

interface EqualizerStore extends EqualizerState {
  toggleEnabled: () => void;
  setEnabled: (enabled: boolean) => void;
  setPreset: (presetName: string) => void;
  setBandGain: (index: number, gain: number) => void;
  setPreamp: (gain: number) => void;
  toggleEqualizer: () => void;
  setEqualizerOpen: (open: boolean) => void;
  resetEqualizer: () => void;
}

const DEFAULT_BANDS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const useEqualizerStore = create<EqualizerStore>((set, get) => ({
  isEnabled: true,
  selectedPreset: "Default",
  preamp: 0,
  bands: [...DEFAULT_BANDS],
  isEqualizerOpen: false,

  toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),
  
  setEnabled: (enabled: boolean) => set({ isEnabled: enabled }),

  setPreset: (presetName: string) => {
    const preset = EQUALIZER_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    set({
      selectedPreset: presetName,
      bands: [...preset.bands],
      preamp: preset.preamp !== undefined ? preset.preamp : 0
    });
  },

  setBandGain: (index: number, gain: number) => {
    const { bands } = get();
    if (index < 0 || index >= bands.length) return;

    const clampedGain = Math.max(-12, Math.min(12, gain));
    const newBands = [...bands];
    newBands[index] = clampedGain;

    set({
      bands: newBands,
      selectedPreset: CUSTOM_PRESET_NAME
    });
  },

  setPreamp: (gain: number) => {
    const clampedGain = Math.max(-12, Math.min(12, gain));
    set({
      preamp: clampedGain,
      selectedPreset: CUSTOM_PRESET_NAME
    });
  },

  toggleEqualizer: () =>
    set((state) => ({ isEqualizerOpen: !state.isEqualizerOpen })),

  setEqualizerOpen: (open: boolean) => set({ isEqualizerOpen: open }),

  resetEqualizer: () =>
    set({
      selectedPreset: "Default",
      preamp: 0,
      bands: [...DEFAULT_BANDS]
    })
}));
